import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const hashToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ---------- 5.1 Register (Company + Owner) ----------
  async register(dto: RegisterDto) {
    const existing = await this.prisma.company.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A company with this email already exists');

    const rounds = this.config.get<number>('security.bcryptRounds')!;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const { company, user } = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { companyName: dto.companyName, email: dto.email, phone: dto.phone },
      });
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: dto.ownerName,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: 'owner',
          status: 'active', // TODO: flip to 'pending' once email verification worker is wired
        },
      });
      return { company, user };
    });

    // TODO(P0 follow-up): create EmailVerificationToken + enqueue verify email job.

    const tokens = await this.issueTokenPair(user.id, company.id, user.role, user.email);
    return { ...tokens, user: this.sanitizeUser(user), company };
  }

  // ---------- 5.2 Login ----------
  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Generic failure message regardless of which check fails (§4.1 validation rules).
    const genericError = () => new UnauthorizedException('Invalid email or password');

    if (!user) throw genericError();

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    const threshold = this.config.get<number>('security.failedLoginThreshold')!;
    const lockMinutes = this.config.get<number>('security.accountLockMinutes')!;

    if (!valid) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lockedUntil =
        failedLoginCount >= threshold ? new Date(Date.now() + lockMinutes * 60_000) : null;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount, lockedUntil },
      });
      throw genericError();
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const tokens = await this.issueTokenPair(user.id, user.companyId, user.role, user.email, {
      deviceId: dto.deviceId,
      ...meta,
    });
    const company = await this.prisma.company.findUnique({ where: { id: user.companyId } });
    return { ...tokens, user: this.sanitizeUser(user), company };
  }

  // ---------- 5.3 Refresh (rotation + theft detection) ----------
  async refresh(userId: string, rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);
    const session = await this.prisma.session.findFirst({
      where: { userId, refreshTokenHash: tokenHash },
    });

    if (!session || session.revoked || session.expiresAt < new Date()) {
      if (session?.revoked) {
        // Reuse of an already-rotated/revoked token → treat as theft, kill all sessions.
        await this.prisma.session.updateMany({ where: { userId }, data: { revoked: true } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    // rotate: revoke old, issue new
    await this.prisma.session.update({ where: { id: session.id }, data: { revoked: true } });
    return this.issueTokenPair(user.id, user.companyId, user.role, user.email, {
      deviceId: session.deviceId ?? undefined,
    });
  }

  // ---------- 5.4 Forgot / Reset password ----------
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; // 202 regardless — don't leak whether the email exists

    const raw = randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 60 * 60_000), // 1h
      },
    });
    // TODO(P1): enqueue email job with `raw` token in the reset link (never store raw).
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!record) throw new UnauthorizedException('Invalid or expired reset token');

    const rounds = this.config.get<number>('security.bcryptRounds')!;
    const passwordHash = await bcrypt.hash(newPassword, rounds);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Password change → revoke all sessions (§9.2 token policy).
      this.prisma.session.updateMany({ where: { userId: record.userId }, data: { revoked: true } }),
    ]);
  }

  // ---------- Logout / Sessions ----------
  async logout(userId: string, rawRefreshToken?: string) {
    if (rawRefreshToken) {
      await this.prisma.session.updateMany({
        where: { userId, refreshTokenHash: hashToken(rawRefreshToken) },
        data: { revoked: true },
      });
    } else {
      await this.prisma.session.updateMany({ where: { userId }, data: { revoked: true } });
    }
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
      select: { id: true, deviceId: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revoked: true },
    });
  }

  // ---------- Internal helpers ----------
  private async issueTokenPair(
    userId: string,
    companyId: string,
    role: string,
    email: string,
    meta: { deviceId?: string; ip?: string; userAgent?: string } = {},
  ) {
    const payload = { sub: userId, companyId, role, email };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessTtl'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshTtl'),
    });

    const refreshTtlMs = 7 * 24 * 60 * 60_000; // keep in sync with JWT_REFRESH_TTL default
    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hashToken(refreshToken),
        deviceId: meta.deviceId,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    return { accessToken, refreshToken, expiresIn: 900, tokenType: 'Bearer' };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
