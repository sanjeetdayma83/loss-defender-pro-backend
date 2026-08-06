import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EvidenceService } from '../evidence/evidence.service';

@Injectable()
export class RecordingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly evidence: EvidenceService,
  ) {}

  list(companyId: string) {
    return this.prisma.recording.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getOne(companyId: string, id: string) {
    const rec = await this.prisma.recording.findFirst({ where: { id, companyId } });
    if (!rec) throw new NotFoundException('Recording not found');
    return rec;
  }

  async start(companyId: string, actorId: string, orderId: string, warehouseId: string) {
    const order = await this.prisma.order.findFirst({ where: { id: orderId, companyId } });
    if (!order) throw new NotFoundException('Order not found');
    const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } });
    if (!wh) throw new BadRequestException('Warehouse not in your company');

    const rec = await this.prisma.recording.create({
      data: {
        companyId,
        orderId,
        warehouseId,
        operatorId: actorId,
        status: 'started',
        startedAt: new Date(),
        segmentCount: 0,
      } as any,
    });

    try {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'recording' as any },
      });
    } catch (_) {}

    // Audit
    await this.writeAudit(companyId, actorId, 'recording.start', 'Recording', rec.id, { orderId });

    return rec;
  }

  async stop(companyId: string, recordingId: string, actorId: string, durationSec?: number, segmentCount?: number) {
    const rec = await this.prisma.recording.findFirst({ where: { id: recordingId, companyId } });
    if (!rec) throw new NotFoundException('Recording not found');

    const data: any = {
      status: 'completed',
      completedAt: new Date(),
    };
    if (durationSec != null) data.durationSec = durationSec;
    if (segmentCount != null) data.segmentCount = segmentCount;

    const updated = await this.prisma.recording.update({ where: { id: recordingId }, data });

    // Create evidence properly
    let evidence: any = null;
    try {
      evidence = await this.evidence.createFromRecording(
        companyId,
        rec.orderId,
        rec.id,
        segmentCount ?? 1,
      );
    } catch (e: any) {
      console.error('evidence create', e?.message);
    }

    try {
      await this.prisma.order.update({
        where: { id: rec.orderId },
        data: { status: 'evidence_ready' as any },
      });
    } catch (_) {}

    await this.writeAudit(companyId, actorId, 'recording.stop', 'Recording', recordingId, {
      durationSec,
      segmentCount,
      evidenceId: evidence?.id,
    });

    return { recording: updated, evidence };
  }

  async presignSegment(
    companyId: string,
    recordingId: string,
    segmentIndex: number,
    contentType = 'video/webm',
  ) {
    const rec = await this.prisma.recording.findFirst({ where: { id: recordingId, companyId } });
    if (!rec) throw new NotFoundException('Recording not found');
    const key = this.storage.recordingSegmentKey(companyId, recordingId, segmentIndex);
    return {
      ...(await this.storage.presignPut(key, contentType)),
      segmentIndex,
      recordingId,
    };
  }

  private async writeAudit(
    companyId: string,
    actorId: string,
    action: string,
    entity: string,
    entityId: string,
    meta?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId,
          actorId,
          action,
          entity,
          entityId,
          meta: meta ?? {},
        } as any,
      });
    } catch (e) {
      // never break main flow
      console.warn('audit write failed', e);
    }
  }
}
