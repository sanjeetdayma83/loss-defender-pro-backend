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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReturnsService = class ReturnsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: dto.orderId, companyId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return this.prisma.return.create({
            data: {
                companyId,
                orderId: dto.orderId,
                reason: dto.reason,
            },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
            },
        });
    }
    async list(companyId, status) {
        return this.prisma.return.findMany({
            where: {
                companyId,
                ...(status ? { status: status } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
            },
            take: 50,
        });
    }
    async findOne(companyId, id) {
        const r = await this.prisma.return.findFirst({
            where: { id, companyId },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
            },
        });
        if (!r)
            throw new common_1.NotFoundException('Return not found');
        return r;
    }
    async update(companyId, id, dto) {
        await this.findOne(companyId, id);
        return this.prisma.return.update({
            where: { id },
            data: {
                ...(dto.status ? { status: dto.status } : {}),
                ...(dto.conditionNote !== undefined ? { conditionNote: dto.conditionNote } : {}),
                ...(dto.decision !== undefined ? { decision: dto.decision } : {}),
                ...(dto.status === 'closed' ? { closedAt: new Date() } : {}),
            },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
            },
        });
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map