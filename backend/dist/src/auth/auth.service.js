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
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async signAccess(payload) {
        return this.jwt.signAsync(payload, {
            secret: this.config.get('jwt.accessSecret') ??
                process.env.JWT_ACCESS_SECRET ??
                'dev-access',
            expiresIn: this.config.get('jwt.accessExpiresIn') ?? '15m',
        });
    }
    async issueRefresh(userId, deviceId, ua, ip) {
        const raw = (0, crypto_1.randomBytes)(48).toString('hex');
        const tokenHash = this.hashToken(raw);
        const expiresAt = new Date(Date.now() + 7 * 864e5);
        await this.prisma.refreshSession.create({
            data: { userId, tokenHash, deviceId, userAgent: ua, ipAddress: ip, expiresAt },
        });
        return raw;
    }
    otpCode() {
        return String((0, crypto_1.randomInt)(100000, 999999));
    }
    defaultPlan() {
        const plans = Object.values(client_1.CompanyPlan);
        if (plans.includes('starter'))
            return 'starter';
        if (plans.includes('free'))
            return 'free';
        if (plans.includes('professional'))
            return 'professional';
        return plans[0];
    }
    async register(dto, ip) {
        const exists = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('Email already registered');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const company = await this.prisma.company.create({
            data: {
                companyName: dto.companyName,
                email: dto.email,
                status: 'active',
                plan: this.defaultPlan(),
            },
        });
        const user = await this.prisma.user.create({
            data: {
                companyId: company.id,
                email: dto.email,
                name: dto.name,
                phone: dto.phone ?? '',
                role: 'owner',
                passwordHash,
                status: 'active',
            },
        });
        const code = this.otpCode();
        await this.prisma.authOtp.create({
            data: {
                email: dto.email,
                code,
                purpose: 'verify_email',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        console.log(`[DEV OTP verify_email] ${dto.email} => ${code}`);
        const tokens = await this.tokensFor(user, undefined, ip);
        return {
            ...tokens,
            user: {
                id: user.id, email: user.email, name: user.name,
                role: user.role, companyId: company.id,
            },
            company: { id: company.id, companyName: company.companyName },
            devVerifyCode: code,
        };
    }
    async tokensFor(user, deviceId, ip, ua) {
        const accessToken = await this.signAccess({
            sub: user.id, email: user.email, companyId: user.companyId, role: user.role,
        });
        const refreshToken = await this.issueRefresh(user.id, deviceId, ua, ip);
        return { accessToken, refreshToken };
    }
    async login(dto, ip, ua) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email, status: { not: 'deleted' } },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const lockedUntil = user.lockedUntil;
        if (lockedUntil && lockedUntil > new Date()) {
            throw new common_1.ForbiddenException(`Account locked until ${lockedUntil.toISOString()}`);
        }
        const ok = await bcrypt.compare(dto.password, user.passwordHash);
        if (!ok) {
            const fails = (user.failedLoginCount ?? 0) + 1;
            const data = { failedLoginCount: fails };
            if (fails >= 5) {
                data.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                data.failedLoginCount = 0;
            }
            await this.prisma.user.update({ where: { id: user.id }, data });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedLoginCount: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        });
        const tokens = await this.tokensFor(user, dto.deviceId, ip, ua);
        return {
            ...tokens,
            user: {
                id: user.id, email: user.email, name: user.name,
                role: user.role, companyId: user.companyId,
            },
        };
    }
    async refresh(dto, ip, ua) {
        const tokenHash = this.hashToken(dto.refreshToken);
        const session = await this.prisma.refreshSession.findFirst({
            where: { tokenHash, revokedAt: null },
            include: { user: true },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (session.user.status === 'deleted' || session.user.status === 'suspended') {
            throw new common_1.ForbiddenException('User disabled');
        }
        await this.prisma.refreshSession.update({
            where: { id: session.id },
            data: { revokedAt: new Date() },
        });
        return this.tokensFor(session.user, dto.deviceId ?? session.deviceId ?? undefined, ip, ua);
    }
    async logout(userId, dto) {
        if (dto.refreshToken) {
            const tokenHash = this.hashToken(dto.refreshToken);
            await this.prisma.refreshSession.updateMany({
                where: { userId, tokenHash, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        else if (dto.deviceId) {
            await this.prisma.refreshSession.updateMany({
                where: { userId, deviceId: dto.deviceId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        else {
            await this.prisma.refreshSession.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        return { ok: true };
    }
    async sessions(userId) {
        return this.prisma.refreshSession.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            select: {
                id: true, deviceId: true, userAgent: true, ipAddress: true,
                expiresAt: true, createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async revokeSession(userId, sessionId) {
        await this.prisma.refreshSession.updateMany({
            where: { id: sessionId, userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { ok: true };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (user) {
            const code = this.otpCode();
            await this.prisma.authOtp.create({
                data: {
                    email: dto.email,
                    code,
                    purpose: 'reset_password',
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                },
            });
            console.log(`[DEV OTP reset_password] ${dto.email} => ${code}`);
            return { ok: true, devCode: code };
        }
        return { ok: true };
    }
    async resetPassword(dto) {
        const otp = await this.prisma.authOtp.findFirst({
            where: {
                email: dto.email,
                purpose: 'reset_password',
                code: dto.code,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp)
            throw new common_1.BadRequestException('Invalid or expired code');
        const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, failedLoginCount: 0, lockedUntil: null },
        });
        await this.prisma.authOtp.update({
            where: { id: otp.id },
            data: { usedAt: new Date() },
        });
        await this.prisma.refreshSession.updateMany({
            where: { userId: user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { ok: true };
    }
    async verifyEmail(dto) {
        const otp = await this.prisma.authOtp.findFirst({
            where: {
                email: dto.email,
                purpose: 'verify_email',
                code: dto.code,
                usedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp)
            throw new common_1.BadRequestException('Invalid or expired code');
        await this.prisma.user.updateMany({
            where: { email: dto.email },
            data: { emailVerifiedAt: new Date() },
        });
        await this.prisma.authOtp.update({
            where: { id: otp.id },
            data: { usedAt: new Date() },
        });
        return { ok: true };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findFirst({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Current password incorrect');
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await this.prisma.refreshSession.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { ok: true };
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