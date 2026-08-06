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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClaimsService = class ClaimsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(companyId) {
        return this.prisma.claim.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async create(companyId, actorId, data) {
        if (data.orderId) {
            const o = await this.prisma.order.findFirst({
                where: { id: data.orderId, companyId },
            });
            if (!o)
                throw new common_1.NotFoundException('Order not found');
        }
        const attempts = [
            {
                companyId,
                orderId: data.orderId,
                title: data.title,
                reason: data.reason ?? data.title,
                amount: data.amount,
                status: 'open',
                createdById: actorId,
            },
            {
                companyId,
                orderId: data.orderId,
                title: data.title,
                reason: data.reason ?? data.title,
                status: 'open',
            },
            {
                companyId,
                orderId: data.orderId,
                reason: data.reason ?? data.title,
                status: 'open',
            },
        ];
        let last;
        for (const row of attempts) {
            try {
                return await this.prisma.claim.create({ data: row });
            }
            catch (e) {
                last = e;
            }
        }
        throw new common_1.NotFoundException(`Claim create failed: ${last?.message ?? last}`);
    }
    async updateStatus(companyId, id, status) {
        const c = await this.prisma.claim.findFirst({ where: { id, companyId } });
        if (!c)
            throw new common_1.NotFoundException('Claim not found');
        return this.prisma.claim.update({
            where: { id },
            data: { status },
        });
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map