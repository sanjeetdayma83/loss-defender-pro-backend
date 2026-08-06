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
const crypto_1 = require("crypto");
let UsersService = class UsersService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async list(companyId) {
        return this.prisma.user.findMany({
            where: {
                companyId,
                status: { not: 'deleted' },
            },
            select: {
                id: true,
                employeeId: true,
                email: true,
                name: true,
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
    async me(userId, companyId) {
        let user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                companyId,
                status: { not: 'deleted' },
            },
            select: {
                id: true,
                employeeId: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                profilePhoto: true,
                joiningDate: true,
                lastLoginAt: true,
                createdAt: true,
                warehouse: { select: { id: true, name: true, code: true } },
                company: { select: { id: true, companyName: true, plan: true } },
            },
        });
        if (!user) {
            user = await this.prisma.user.findFirst({
                where: {
                    companyId,
                    role: 'owner',
                    status: { not: 'deleted' },
                },
                select: {
                    id: true,
                    employeeId: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                    status: true,
                    warehouseId: true,
                    profilePhoto: true,
                    joiningDate: true,
                    lastLoginAt: true,
                    createdAt: true,
                    warehouse: { select: { id: true, name: true, code: true } },
                    company: { select: { id: true, companyName: true, plan: true } },
                },
            });
        }
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async getOne(companyId, id) {
        const user = await this.prisma.user.findFirst({
            where: { id, companyId, status: { not: 'deleted' } },
            select: {
                id: true,
                employeeId: true,
                email: true,
                name: true,
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
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async invite(companyId, actorId, dto, ip) {
        const exists = await this.prisma.user.findFirst({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.NotFoundException('Warehouse not found');
        }
        const tempPass = (0, crypto_1.randomBytes)(8).toString('hex');
        const hash = await bcrypt.hash(tempPass, 12);
        const created = await this.prisma.user.create({
            data: {
                companyId,
                email: dto.email,
                name: dto.name,
                phone: dto.phone ?? '',
                role: dto.role,
                warehouseId: dto.warehouseId,
                passwordHash: hash,
                status: 'pending',
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                createdAt: true,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'user.invite',
            entity: 'User',
            entityId: created.id,
            after: created,
            ipAddress: ip,
        });
        return { ...created, tempPassword: tempPass };
    }
    async update(companyId, id, actorId, dto, ip) {
        const before = await this.prisma.user.findFirst({
            where: { id, companyId, status: { not: 'deleted' } },
        });
        if (!before)
            throw new common_1.NotFoundException('User not found');
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.NotFoundException('Warehouse not found');
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.role !== undefined)
            data.role = dto.role;
        if (dto.warehouseId !== undefined)
            data.warehouseId = dto.warehouseId;
        if (dto.status !== undefined)
            data.status = dto.status;
        const updated = await this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                status: true,
                warehouseId: true,
                updatedAt: true,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'user.update',
            entity: 'User',
            entityId: id,
            before: before,
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
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map