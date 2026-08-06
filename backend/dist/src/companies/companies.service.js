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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let CompaniesService = class CompaniesService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async getMine(companyId) {
        const company = await this.prisma.company.findFirst({
            where: { id: companyId, status: { not: 'deleted' } },
            select: {
                id: true,
                companyName: true,
                gst: true,
                pan: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                timezone: true,
                currency: true,
                storageUsed: true,
                storageQuota: true,
                plan: true,
                logo: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        return {
            ...company,
            storageUsed: company.storageUsed.toString(),
            storageQuota: company.storageQuota.toString(),
        };
    }
    async updateMine(companyId, actorId, dto, ip) {
        const before = await this.prisma.company.findFirst({
            where: { id: companyId, status: { not: 'deleted' } },
        });
        if (!before)
            throw new common_1.NotFoundException('Company not found');
        const data = {
            companyName: dto.companyName,
            gst: dto.gst,
            pan: dto.pan,
            phone: dto.phone,
            website: dto.website,
            timezone: dto.timezone,
            currency: dto.currency,
            logo: dto.logo,
        };
        if (dto.address !== undefined) {
            data.address = dto.address;
        }
        const updated = await this.prisma.company.update({
            where: { id: companyId },
            data,
            select: {
                id: true,
                companyName: true,
                gst: true,
                pan: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                timezone: true,
                currency: true,
                plan: true,
                logo: true,
                status: true,
                updatedAt: true,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'company.update',
            entity: 'Company',
            entityId: companyId,
            before: before,
            after: updated,
            ipAddress: ip,
        });
        return updated;
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map