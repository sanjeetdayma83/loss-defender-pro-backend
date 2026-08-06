import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartRecordingDto } from './dto/start-recording.dto';
import { AddSegmentDto } from './dto/add-segment.dto';
import { RecordingStatus } from '@prisma/client';

@Injectable()
export class RecordingsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(companyId: string, operatorId: string, dto: StartRecordingDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, companyId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: dto.warehouseId, companyId },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const active = await this.prisma.recording.findFirst({
      where: {
        orderId: dto.orderId,
        companyId,
        status: { in: [RecordingStatus.started, RecordingStatus.paused] },
      },
    });
    if (active) {
      throw new BadRequestException('Order already has an active recording');
    }

    const recording = await this.prisma.recording.create({
      data: {
        companyId,
        orderId: dto.orderId,
        warehouseId: dto.warehouseId,
        stationId: dto.stationId ?? null,
        operatorId,
        status: RecordingStatus.started,
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

  async pause(companyId: string, id: string) {
    const rec = await this.findOneOrFail(companyId, id);
    if (rec.status !== RecordingStatus.started) {
      throw new BadRequestException('Only started recordings can be paused');
    }
    return this.prisma.recording.update({
      where: { id },
      data: { status: RecordingStatus.paused, pausedAt: new Date() },
    });
  }

  async resume(companyId: string, id: string) {
    const rec = await this.findOneOrFail(companyId, id);
    if (rec.status !== RecordingStatus.paused) {
      throw new BadRequestException('Only paused recordings can be resumed');
    }
    return this.prisma.recording.update({
      where: { id },
      data: { status: RecordingStatus.started, pausedAt: null },
    });
  }

  async stop(companyId: string, id: string) {
    const rec = await this.findOneOrFail(companyId, id);
    if (
      rec.status !== RecordingStatus.started &&
      rec.status !== RecordingStatus.paused
    ) {
      throw new BadRequestException('Recording is not active');
    }

    const completedAt = new Date();
    const durationSec = Math.floor(
      (completedAt.getTime() - rec.startedAt.getTime()) / 1000,
    );

    const updated = await this.prisma.recording.update({
      where: { id },
      data: {
        status: RecordingStatus.completed,
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

  async addSegment(companyId: string, id: string, dto: AddSegmentDto) {
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

  async findOne(companyId: string, id: string) {
    return this.findOneOrFail(companyId, id);
  }

  async list(companyId: string, orderId?: string) {
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

  private async findOneOrFail(companyId: string, id: string) {
    const rec = await this.prisma.recording.findFirst({
      where: { id, companyId },
      include: {
        operator: { select: { id: true, name: true } },
        segments: { orderBy: { sequence: 'asc' } },
        evidence: true,
      },
    });
    if (!rec) throw new NotFoundException('Recording not found');
    return rec;
  }
}