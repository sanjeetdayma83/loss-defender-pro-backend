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
exports.ScannerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_1 = require("../common/utils/tenant");
let ScannerService = class ScannerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async scan(companyId, operatorId, orderId, barcode, expectedSku) {
        const order = await this.prisma.order.findFirst({
            where: (0, tenant_1.tenantWhere)(companyId, { id: orderId }),
            include: { items: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const code = barcode.trim();
        if (!code)
            throw new common_1.BadRequestException('Empty barcode');
        const prior = await this.prisma.scanEvent.findFirst({
            where: { companyId, orderId, barcode: code },
        });
        if (prior) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_SCAN',
                message: 'Barcode already scanned for this order',
                scannedAt: prior.createdAt,
            });
        }
        const items = order.items ?? [];
        const match = items.find((i) => i.sku === code ||
            i.barcode === code ||
            i.ean === code ||
            i.marketplaceSku === code);
        let result = 'unknown';
        if (match)
            result = 'matched';
        else if (expectedSku && expectedSku !== code)
            result = 'wrong_sku';
        const event = await this.prisma.scanEvent.create({
            data: {
                companyId,
                orderId,
                operatorId,
                barcode: code,
                result,
                expectedSku: expectedSku ?? null,
                matchedItemId: match?.id ?? null,
            },
        });
        if (result === 'matched') {
            const cur = String(order.status).toLowerCase();
            if (cur === 'queued' || cur === 'synced') {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: { status: 'scanned' },
                });
            }
        }
        return {
            event,
            result,
            alert: result === 'wrong_sku'
                ? { type: 'WRONG_SKU', message: `Expected ${expectedSku}, got ${code}` }
                : result === 'unknown'
                    ? { type: 'UNKNOWN_BARCODE', message: 'Barcode not in order items' }
                    : null,
            orderStatus: order.status,
        };
    }
};
exports.ScannerService = ScannerService;
exports.ScannerService = ScannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScannerService);
//# sourceMappingURL=scanner.service.js.map