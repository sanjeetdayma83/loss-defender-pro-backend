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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_1 = require("../common/utils/tenant");
const ALLOWED = {
    synced: ['queued', 'packing'],
    queued: ['packing', 'scanned', 'failed'],
    scanned: ['packing', 'recording'],
    packing: ['recording', 'scanned'],
    recording: ['evidence_ready', 'failed'],
    evidence_ready: ['dispatched', 'failed'],
    dispatched: ['shipped', 'claimed', 'returned'],
    shipped: ['closed', 'claimed', 'returned'],
    claimed: ['closed'],
    returned: ['closed'],
    failed: ['queued'],
    exception: ['queued', 'closed'],
};
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(companyId) {
        return this.prisma.order.findMany({
            where: (0, tenant_1.tenantWhere)(companyId),
            orderBy: { createdAt: 'desc' },
            include: {
                items: true,
                warehouse: { select: { id: true, name: true, code: true } },
            },
        });
    }
    async getOne(companyId, id) {
        const o = await this.prisma.order.findFirst({
            where: (0, tenant_1.tenantWhere)(companyId, { id }),
            include: { items: true },
        });
        if (!o)
            throw new common_1.NotFoundException('Order not found');
        return o;
    }
    async transition(companyId, id, toStatus, extra = {}) {
        const order = await this.getOne(companyId, id);
        const from = String(order.status || '').toLowerCase();
        const to = toStatus.toLowerCase();
        const allowed = ALLOWED[from] ?? [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition ${from} → ${to}`);
        }
        return this.prisma.order.update({
            where: { id },
            data: {
                status: to,
                ...extra,
            },
        });
    }
    async dispatch(companyId, id, awb) {
        if (!awb?.trim())
            throw new common_1.BadRequestException('AWB required');
        return this.transition(companyId, id, 'dispatched', {
            awb: awb.trim(),
            dispatchedAt: new Date(),
        });
    }
    async markShipped(companyId, id) {
        return this.transition(companyId, id, 'shipped', {
            shippedAt: new Date(),
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map