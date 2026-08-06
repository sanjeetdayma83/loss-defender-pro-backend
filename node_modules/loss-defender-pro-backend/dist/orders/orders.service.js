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
const audit_service_1 = require("../audit/audit.service");
const TRANSITIONS = {
    synced: ['queued', 'packing'],
    queued: ['packing'],
    packing: ['recording', 'scanned'],
    recording: ['scanned'],
    scanned: ['evidence_ready', 'packing'],
    evidence_ready: ['dispatched'],
    dispatched: ['shipped', 'claimed', 'returned'],
    shipped: ['closed', 'claimed', 'returned'],
    claimed: ['closed'],
    returned: ['closed'],
    closed: [],
};
let OrdersService = class OrdersService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list(companyId, status) {
        return this.prisma.order.findMany({
            where: {
                companyId,
                ...(status ? { status } : {}),
            },
            include: {
                items: true,
                warehouse: { select: { id: true, name: true, code: true } },
                assignedOperator: { select: { id: true, name: true, email: true } },
                station: { select: { id: true, stationName: true, stationId: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getOne(companyId, id) {
        const order = await this.prisma.order.findFirst({
            where: { id, companyId },
            include: {
                items: true,
                warehouse: true,
                assignedOperator: { select: { id: true, name: true, email: true, role: true } },
                station: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async create(companyId, actorId, dto, ip) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('At least one item is required');
        }
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.BadRequestException('Warehouse not in your company');
        }
        const order = await this.prisma.order.create({
            data: {
                companyId,
                warehouseId: dto.warehouseId,
                marketplace: dto.marketplace ?? 'manual',
                marketplaceOrderId: dto.marketplaceOrderId,
                customerName: dto.customerName,
                customerPhone: dto.customerPhone,
                shippingAddress: dto.shippingAddress,
                notes: dto.notes,
                status: 'synced',
                items: {
                    create: dto.items.map((i) => ({
                        sku: i.sku,
                        name: i.name,
                        qty: i.qty,
                        barcode: i.barcode,
                        scannedQty: 0,
                        status: 'pending',
                    })),
                },
            },
            include: { items: true },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'order.create',
            entity: 'Order',
            entityId: order.id,
            after: order,
            ipAddress: ip,
        });
        return order;
    }
    async assign(companyId, id, actorId, dto, ip) {
        const order = await this.prisma.order.findFirst({ where: { id, companyId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const operator = await this.prisma.user.findFirst({
            where: { id: dto.operatorId, companyId, status: { not: 'deleted' } },
        });
        if (!operator)
            throw new common_1.BadRequestException('Operator not found in company');
        if (dto.stationId) {
            const station = await this.prisma.station.findFirst({
                where: { id: dto.stationId },
                include: { warehouse: true },
            });
            if (!station || station.warehouse.companyId !== companyId) {
                throw new common_1.BadRequestException('Station not in your company');
            }
        }
        if (dto.warehouseId) {
            const wh = await this.prisma.warehouse.findFirst({
                where: { id: dto.warehouseId, companyId },
            });
            if (!wh)
                throw new common_1.BadRequestException('Warehouse not in your company');
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                assignedOperatorId: dto.operatorId,
                stationId: dto.stationId,
                warehouseId: dto.warehouseId ?? order.warehouseId,
                status: order.status === 'synced' ? 'queued' : order.status,
            },
            include: { items: true, assignedOperator: { select: { id: true, name: true } } },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'order.assign',
            entity: 'Order',
            entityId: id,
            before: { assignedOperatorId: order.assignedOperatorId, status: order.status },
            after: {
                assignedOperatorId: updated.assignedOperatorId,
                status: updated.status,
            },
            ipAddress: ip,
        });
        return updated;
    }
    async updateStatus(companyId, id, actorId, dto, ip) {
        const order = await this.prisma.order.findFirst({ where: { id, companyId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const allowed = TRANSITIONS[order.status] ?? [];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
        }
        const data = { status: dto.status };
        if (dto.status === 'dispatched') {
            data.dispatchedAt = new Date();
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data,
            include: { items: true },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'order.status_change',
            entity: 'Order',
            entityId: id,
            before: { status: order.status },
            after: { status: updated.status },
            ipAddress: ip,
        });
        return updated;
    }
    async scan(companyId, orderId, actorId, dto, ip) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, companyId },
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (!['synced', 'queued', 'packing', 'recording', 'scanned'].includes(order.status)) {
            throw new common_1.BadRequestException(`Cannot scan in status ${order.status}`);
        }
        const code = dto.barcodeOrSku.trim();
        const item = order.items.find((i) => i.sku === code || i.barcode === code);
        if (!item) {
            throw new common_1.BadRequestException({
                code: 'WRONG_SKU',
                message: `Barcode/SKU "${code}" is not on this order`,
            });
        }
        if (item.scannedQty >= item.qty) {
            throw new common_1.ConflictException({
                code: 'ALREADY_SCANNED',
                message: `SKU ${item.sku} already fully scanned (${item.scannedQty}/${item.qty})`,
            });
        }
        const newQty = item.scannedQty + 1;
        let itemStatus = 'partial';
        if (newQty >= item.qty)
            itemStatus = 'matched';
        await this.prisma.orderItem.update({
            where: { id: item.id },
            data: { scannedQty: newQty, status: itemStatus },
        });
        const refreshed = await this.prisma.order.findFirst({
            where: { id: orderId },
            include: { items: true },
        });
        const allMatched = refreshed.items.every((i) => i.scannedQty >= i.qty);
        if (allMatched && refreshed.status !== 'scanned') {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'scanned' },
            });
        }
        else if (['synced', 'queued'].includes(refreshed.status)) {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'packing' },
            });
        }
        const result = await this.getOne(companyId, orderId);
        await this.audit.log({
            companyId,
            actorId,
            action: 'order.scan',
            entity: 'OrderItem',
            entityId: item.id,
            after: { sku: item.sku, scannedQty: newQty, status: itemStatus },
            ipAddress: ip,
        });
        return {
            scan: {
                sku: item.sku,
                scannedQty: newQty,
                qty: item.qty,
                itemStatus,
                allMatched,
            },
            order: result,
        };
    }
    async dispatch(companyId, id, actorId, dto, ip) {
        const order = await this.prisma.order.findFirst({ where: { id, companyId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== 'evidence_ready' && order.status !== 'scanned') {
            throw new common_1.BadRequestException(`Cannot dispatch from status ${order.status}; need scanned or evidence_ready`);
        }
        const updated = await this.prisma.order.update({
            where: { id },
            data: {
                status: 'dispatched',
                awb: dto.awb,
                courier: dto.courier,
                dispatchedAt: new Date(),
            },
            include: { items: true },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'order.dispatch',
            entity: 'Order',
            entityId: id,
            before: { status: order.status, awb: order.awb },
            after: { status: updated.status, awb: updated.awb, courier: updated.courier },
            ipAddress: ip,
        });
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map