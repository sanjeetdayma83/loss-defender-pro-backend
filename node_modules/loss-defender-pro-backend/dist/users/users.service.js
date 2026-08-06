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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    constructor(prisma, audit, config) {
        this.prisma = prisma;
        this.audit = audit;
        this.config = config;
    }
    list(companyId) {
        return this.prisma.user.findMany({
            where: { companyId, status: { not: 'deleted' } },
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                profilePhoto: true,
                joiningDate: true,
                lastLoginAt: true,
                createdAt: true,
                warehouse: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(companyId, id) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId, status: { not: 'deleted' } },
            select: {
                id: true,
                employeeId: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                profilePhoto: true,
                joiningDate: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                warehouse: { select: { id: true, name: true, code: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async invite(companyId, actorId, dto, ip) {
        if (dto.role === client_1.Role.super_admin) {
            throw new common_1.ForbiddenException('Cannot invite super_admin');
        }
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.BadRequestException('Warehouse not in your company');
        }
        const tempPassword = (0, crypto_1.randomBytes)(9).toString('base64url');
        const rounds = this.config.get('security.bcryptRounds') ?? 12;
        const passwordHash = await bcrypt.hash(tempPassword, rounds);
        const user = await this.prisma.user.create({
            data: {
                companyId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                role: dto.role,
                warehouseId: dto.warehouseId,
                employeeId: dto.employeeId,
                passwordHash,
                status: 'pending',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                employeeId: true,
                createdAt: true,
            },
        });
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        await this.prisma.inviteToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'user.invite',
            entity: 'User',
            entityId: user.id,
            after: user,
            ipAddress: ip,
        });
        return {
            user,
            inviteToken: rawToken,
            tempPassword,
        };
    }
    async update(companyId, id, actorId, dto, ip) {
        const before = await this.prisma.user.findFirst({
            where: { id, companyId, status: { not: 'deleted' } },
        });
        if (!before)
            throw new common_1.NotFoundException('User not found');
        if (dto.role === client_1.Role.super_admin) {
            throw new common_1.ForbiddenException('Cannot assign super_admin');
        }
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.BadRequestException('Warehouse not in your company');
        }
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                phone: dto.phone,
                role: dto.role,
                status: dto.status,
                warehouseId: dto.warehouseId === null ? null : dto.warehouseId,
                employeeId: dto.employeeId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                employeeId: true,
                updatedAt: true,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'user.update',
            entity: 'User',
            entityId: id,
            before: {
                name: before.name,
                role: before.role,
                status: before.status,
                warehouseId: before.warehouseId,
            },
            after: updated,
            ipAddress: ip,
        });
        return updated;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map