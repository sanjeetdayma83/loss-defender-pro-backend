"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const hashToken = (raw) => (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.prisma.company.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('A company with this email already exists');
        const rounds = this.config.get('security.bcryptRounds');
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
                    status: 'active',
                },
            });
            return { company, user };
        });
        const tokens = await this.issueTokenPair(user.id, company.id, user.role, user.email);
        return { ...tokens, user: this.sanitizeUser(user), company };
    }
    async login(dto, meta) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        const genericError = () => new common_1.UnauthorizedException('Invalid email or password');
        if (!user)
            throw genericError();
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new common_1.UnauthorizedException('Account locked. Try again later.');
        }
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        const threshold = this.config.get('security.failedLoginThreshold');
        const lockMinutes = this.config.get('security.accountLockMinutes');
        if (!valid) {
            const failedLoginCount = user.failedLoginCount + 1;
            const lockedUntil = failedLoginCount >= threshold ? new Date(Date.now() + lockMinutes * 60_000) : null;
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginCount, lockedUntil },
            });
            throw genericError();
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Account is not active');
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
    async refresh(userId, rawRefreshToken) {
        const tokenHash = hashToken(rawRefreshToken);
        const session = await this.prisma.session.findFirst({
            where: { userId, refreshTokenHash: tokenHash },
        });
        if (!session || session.revoked || session.expiresAt < new Date()) {
            if (session?.revoked) {
                await this.prisma.session.updateMany({ where: { userId }, data: { revoked: true } });
            }
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        await this.prisma.session.update({ where: { id: session.id }, data: { revoked: true } });
        return this.issueTokenPair(user.id, user.companyId, user.role, user.email, {
            deviceId: session.deviceId ?? undefined,
        });
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return;
        const raw = (0, crypto_1.randomBytes)(32).toString('hex');
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(raw),
                expiresAt: new Date(Date.now() + 60 * 60_000),
            },
        });
    }
    async resetPassword(rawToken, newPassword) {
        const tokenHash = hashToken(rawToken);
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
        });
        if (!record)
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        const rounds = this.config.get('security.bcryptRounds');
        const passwordHash = await bcrypt.hash(newPassword, rounds);
        await this.prisma.$transaction([
            this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
            this.prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.session.updateMany({ where: { userId: record.userId }, data: { revoked: true } }),
        ]);
    }
    async logout(userId, rawRefreshToken) {
        if (rawRefreshToken) {
            await this.prisma.session.updateMany({
                where: { userId, refreshTokenHash: hashToken(rawRefreshToken) },
                data: { revoked: true },
            });
        }
        else {
            await this.prisma.session.updateMany({ where: { userId }, data: { revoked: true } });
        }
    }
    async listSessions(userId) {
        return this.prisma.session.findMany({
            where: { userId, revoked: false, expiresAt: { gt: new Date() } },
            select: { id: true, deviceId: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async revokeSession(userId, sessionId) {
        await this.prisma.session.updateMany({
            where: { id: sessionId, userId },
            data: { revoked: true },
        });
    }
    async issueTokenPair(userId, companyId, role, email, meta = {}) {
        const payload = { sub: userId, companyId, role, email };
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('jwt.accessSecret'),
            expiresIn: this.config.get('jwt.accessTtl'),
        });
        const refreshToken = await this.jwt.signAsync(payload, {
            secret: this.config.get('jwt.refreshSecret'),
            expiresIn: this.config.get('jwt.refreshTtl'),
        });
        const refreshTtlMs = 7 * 24 * 60 * 60_000;
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
    sanitizeUser(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map