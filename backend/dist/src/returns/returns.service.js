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
const ALLOWED = {
    requested: ['received', 'rejected', 'closed'],
    received: ['inspecting', 'rejected', 'closed'],
    inspecting: ['refunded', 'restocked', 'rejected', 'closed'],
    refunded: ['closed'],
    restocked: ['closed'],
    rejected: ['closed'],
    closed: [],
};
let ReturnsService = class ReturnsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(companyId) {
        return this.prisma.return.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async create(companyId, actorId, data) {
        const o = await this.prisma.order.findFirst({ where: { id: data.orderId, companyId } });
        if (!o)
            throw new common_1.NotFoundException('Order not found');
        const row = await this.prisma.return.create({
            data: {
                companyId,
                orderId: data.orderId,
                reason: data.reason ?? 'customer_return',
                status: 'requested',
                conditionNote: data.notes,
            },
        });
        await this.writeAudit(companyId, actorId, 'return.create', 'Return', row.id, { orderId: data.orderId });
        return row;
    }
    async updateStatus(companyId, actorId, id, status) {
        const row = await this.prisma.return.findFirst({ where: { id, companyId } });
        if (!row)
            throw new common_1.NotFoundException('Return not found');
        const cur = row.status;
        const next = ALLOWED[cur] || [];
        if (!next.includes(status)) {
            throw new common_1.BadRequestException(`Cannot transition ${cur} → ${status}. Allowed: ${next.join(', ') || 'none'}`);
        }
        const data = { status };
        if (status === 'closed')
            data.closedAt = new Date();
        const updated = await this.prisma.return.update({ where: { id }, data });
        await this.writeAudit(companyId, actorId, 'return.status', 'Return', id, { from: cur, to: status });
        return updated;
    }
    async writeAudit(companyId, actorId, action, entity, entityId, meta) {
        try {
            await this.prisma.auditLog.create({
                data: { companyId, actorId, action, entity, entityId, meta: meta ?? {} },
            });
        }
        catch (_) { }
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map