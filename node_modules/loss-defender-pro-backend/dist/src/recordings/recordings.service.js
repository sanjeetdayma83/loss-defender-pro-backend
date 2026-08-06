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
const storage_service_1 = require("../storage/storage.service");
const evidence_service_1 = require("../evidence/evidence.service");
let RecordingsService = class RecordingsService {
    constructor(prisma, storage, evidence) {
        this.prisma = prisma;
        this.storage = storage;
        this.evidence = evidence;
    }
    list(companyId) {
        return this.prisma.recording.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getOne(companyId, id) {
        const rec = await this.prisma.recording.findFirst({ where: { id, companyId } });
        if (!rec)
            throw new common_1.NotFoundException('Recording not found');
        return rec;
    }
    async start(companyId, actorId, orderId, warehouseId) {
        const order = await this.prisma.order.findFirst({ where: { id: orderId, companyId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } });
        if (!wh)
            throw new common_1.BadRequestException('Warehouse not in your company');
        const rec = await this.prisma.recording.create({
            data: {
                companyId,
                orderId,
                warehouseId,
                operatorId: actorId,
                status: 'started',
                startedAt: new Date(),
                segmentCount: 0,
            },
        });
        try {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: 'recording' },
            });
        }
        catch (_) { }
        await this.writeAudit(companyId, actorId, 'recording.start', 'Recording', rec.id, { orderId });
        return rec;
    }
    async stop(companyId, recordingId, actorId, durationSec, segmentCount) {
        const rec = await this.prisma.recording.findFirst({ where: { id: recordingId, companyId } });
        if (!rec)
            throw new common_1.NotFoundException('Recording not found');
        const data = {
            status: 'completed',
            completedAt: new Date(),
        };
        if (durationSec != null)
            data.durationSec = durationSec;
        if (segmentCount != null)
            data.segmentCount = segmentCount;
        const updated = await this.prisma.recording.update({ where: { id: recordingId }, data });
        let evidence = null;
        try {
            evidence = await this.evidence.createFromRecording(companyId, rec.orderId, rec.id, segmentCount ?? 1);
        }
        catch (e) {
            console.error('evidence create', e?.message);
        }
        try {
            await this.prisma.order.update({
                where: { id: rec.orderId },
                data: { status: 'evidence_ready' },
            });
        }
        catch (_) { }
        await this.writeAudit(companyId, actorId, 'recording.stop', 'Recording', recordingId, {
            durationSec,
            segmentCount,
            evidenceId: evidence?.id,
        });
        return { recording: updated, evidence };
    }
    async presignSegment(companyId, recordingId, segmentIndex, contentType = 'video/webm') {
        const rec = await this.prisma.recording.findFirst({ where: { id: recordingId, companyId } });
        if (!rec)
            throw new common_1.NotFoundException('Recording not found');
        const key = this.storage.recordingSegmentKey(companyId, recordingId, segmentIndex);
        return {
            ...(await this.storage.presignPut(key, contentType)),
            segmentIndex,
            recordingId,
        };
    }
    async writeAudit(companyId, actorId, action, entity, entityId, meta) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    companyId,
                    actorId,
                    action,
                    entity,
                    entityId,
                    meta: meta ?? {},
                },
            });
        }
        catch (e) {
            console.warn('audit write failed', e);
        }
    }
};
exports.RecordingsService = RecordingsService;
exports.RecordingsService = RecordingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        evidence_service_1.EvidenceService])
], RecordingsService);
//# sourceMappingURL=recordings.service.js.map