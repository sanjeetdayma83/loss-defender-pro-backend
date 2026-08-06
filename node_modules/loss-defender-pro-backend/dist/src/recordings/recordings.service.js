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
exports.RecordingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RecordingsService = class RecordingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async start(companyId, operatorId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: dto.orderId, companyId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const warehouse = await this.prisma.warehouse.findFirst({
            where: { id: dto.warehouseId, companyId },
        });
        if (!warehouse)
            throw new common_1.NotFoundException('Warehouse not found');
        const active = await this.prisma.recording.findFirst({
            where: {
                orderId: dto.orderId,
                companyId,
                status: { in: [client_1.RecordingStatus.started, client_1.RecordingStatus.paused] },
            },
        });
        if (active) {
            throw new common_1.BadRequestException('Order already has an active recording');
        }
        const recording = await this.prisma.recording.create({
            data: {
                companyId,
                orderId: dto.orderId,
                warehouseId: dto.warehouseId,
                stationId: dto.stationId ?? null,
                operatorId,
                status: client_1.RecordingStatus.started,
                b2Prefix: `${companyId}/recordings/`,
            },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
                operator: { select: { id: true, name: true } },
            },
        });
        return this.prisma.recording.update({
            where: { id: recording.id },
            data: { b2Prefix: `${companyId}/recordings/${recording.id}/` },
            include: {
                order: { select: { id: true, marketplaceOrderId: true, status: true } },
                operator: { select: { id: true, name: true } },
            },
        });
    }
    async pause(companyId, id) {
        const rec = await this.findOneOrFail(companyId, id);
        if (rec.status !== client_1.RecordingStatus.started) {
            throw new common_1.BadRequestException('Only started recordings can be paused');
        }
        return this.prisma.recording.update({
            where: { id },
            data: { status: client_1.RecordingStatus.paused, pausedAt: new Date() },
        });
    }
    async resume(companyId, id) {
        const rec = await this.findOneOrFail(companyId, id);
        if (rec.status !== client_1.RecordingStatus.paused) {
            throw new common_1.BadRequestException('Only paused recordings can be resumed');
        }
        return this.prisma.recording.update({
            where: { id },
            data: { status: client_1.RecordingStatus.started, pausedAt: null },
        });
    }
    async stop(companyId, id) {
        const rec = await this.findOneOrFail(companyId, id);
        if (rec.status !== client_1.RecordingStatus.started &&
            rec.status !== client_1.RecordingStatus.paused) {
            throw new common_1.BadRequestException('Recording is not active');
        }
        const completedAt = new Date();
        const durationSec = Math.floor((completedAt.getTime() - rec.startedAt.getTime()) / 1000);
        const updated = await this.prisma.recording.update({
            where: { id },
            data: {
                status: client_1.RecordingStatus.completed,
                completedAt,
                durationSec,
            },
        });
        await this.prisma.evidence.create({
            data: {
                companyId,
                recordingId: id,
                orderId: rec.orderId,
                status: 'pending',
            },
        });
        return updated;
    }
    async addSegment(companyId, id, dto) {
        await this.findOneOrFail(companyId, id);
        const segment = await this.prisma.recordingSegment.create({
            data: {
                recordingId: id,
                companyId,
                sequence: dto.sequence,
                b2Key: dto.b2Key,
                sizeBytes: BigInt(dto.sizeBytes),
                durationSec: dto.durationSec,
                checksum: dto.checksum,
            },
        });
        await this.prisma.recording.update({
            where: { id },
            data: {
                segmentCount: { increment: 1 },
                totalBytes: { increment: BigInt(dto.sizeBytes) },
            },
        });
        return segment;
    }
    async findOne(companyId, id) {
        return this.findOneOrFail(companyId, id);
    }
    async list(companyId, orderId) {
        return this.prisma.recording.findMany({
            where: {
                companyId,
                ...(orderId ? { orderId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                operator: { select: { id: true, name: true } },
                evidence: { select: { id: true, status: true } },
            },
            take: 50,
        });
    }
    async findOneOrFail(companyId, id) {
        const rec = await this.prisma.recording.findFirst({
            where: { id, companyId },
            include: {
                operator: { select: { id: true, name: true } },
                segments: { orderBy: { sequence: 'asc' } },
                evidence: true,
            },
        });
        if (!rec)
            throw new common_1.NotFoundException('Recording not found');
        return rec;
    }
};
exports.RecordingsService = RecordingsService;
exports.RecordingsService = RecordingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordingsService);
//# sourceMappingURL=recordings.service.js.map