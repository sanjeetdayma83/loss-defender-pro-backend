// src/modules/recordings/services/recording.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, RecordingSession, RecordingStatus } from '@prisma/client';

import { RecordingRepository } from '../repositories/recording.repository';
import { CreateRecordingDto } from '../dto/create-recording.dto';
import { UpdateRecordingDto } from '../dto/update-recording.dto';
import { RecordingQueryDto } from '../dto/recording-query.dto';
import { RecordingStateMachine } from '../utils/recording-state-machine';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RecordingService {
  constructor(
    private readonly recordingRepository: RecordingRepository,
    private readonly stateMachine: RecordingStateMachine,
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateRecordingDto): Promise<RecordingSession> {
    // Priority 4: Validate Relationships
    const companyExists = await this.prisma.company.count({
      where: { id: dto.companyId, isDeleted: false },
    });
    if (!companyExists) {
      throw new BadRequestException('Company not found.');
    }

    const warehouseExists = await this.prisma.warehouse.count({
      where: { id: dto.warehouseId, isDeleted: false },
    });
    if (!warehouseExists) {
      throw new BadRequestException('Warehouse not found.');
    }

    const operatorExists = await this.prisma.user.count({
      where: { id: dto.operatorId, isDeleted: false },
    });
    if (!operatorExists) {
      throw new BadRequestException('Operator not found.');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order || order.isDeleted) {
      throw new BadRequestException('Order not found.');
    }

    if (order.companyId !== dto.companyId) {
      throw new BadRequestException('Order does not belong to the specified company.');
    }

    if (order.warehouseId !== dto.warehouseId) {
      throw new BadRequestException('Order does not belong to the specified warehouse.');
    }

    // Priority 1: Prevent Duplicate Active Sessions
    const active = await this.recordingRepository.findActiveByOrder(
      dto.orderId,
    );

    if (active) {
      throw new ConflictException(
        'An active recording session already exists for this order.',
      );
    }

    return this.recordingRepository.create({
      company: {
        connect: { id: dto.companyId },
      },
      warehouse: {
        connect: { id: dto.warehouseId },
      },
      order: {
        connect: { id: dto.orderId },
      },
      operator: {
        connect: { id: dto.operatorId },
      },
      originalFileName: dto.originalFileName,
      localFileName: dto.localFileName,
      status: RecordingStatus.CREATED,
    });
  }

  async findById(id: string): Promise<RecordingSession> {
    const recording = await this.recordingRepository.findById(id);

    if (!recording) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }

  async findAll(query: RecordingQueryDto): Promise<RecordingSession[]> {
    return this.recordingRepository.findAll({
      where: {
        companyId: query.companyId,
        warehouseId: query.warehouseId,
        orderId: query.orderId,
        operatorId: query.operatorId,
        status: query.status,
        isDeleted: false,
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
    });
  }

  async update(id: string, dto: UpdateRecordingDto): Promise<RecordingSession> {
    await this.findById(id);

    return this.recordingRepository.update(id, dto);
  }

  async delete(id: string): Promise<RecordingSession> {
    await this.findById(id);

    return this.recordingRepository.softDelete(id);
  }

  async changeStatus(
    id: string,
    status: RecordingStatus,
  ): Promise<RecordingSession> {
    const recording = await this.findById(id);

    this.stateMachine.validateTransition(recording.status, status);

    // Priority 2: Automatic Timestamp Updates
    const data: Prisma.RecordingSessionUpdateInput = {};

    switch (status) {
      case RecordingStatus.STARTED:
        data.startedAt = new Date();
        break;

      case RecordingStatus.PAUSED:
        data.pausedAt = new Date();
        break;

      case RecordingStatus.RESUMED:
        data.resumedAt = new Date();
        break;

      case RecordingStatus.STOPPED:
        const stopped = new Date();
        data.stoppedAt = stopped;

        // Priority 3: Calculate Duration
        if (recording.startedAt) {
          data.durationSeconds = Math.floor(
            (stopped.getTime() - recording.startedAt.getTime()) / 1000,
          );
        }
        break;
    }

    return this.recordingRepository.updateStatus(id, status, data);
  }

  async startRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.STARTED);
  }

  async pauseRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.PAUSED);
  }

  async resumeRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.RESUMED);
  }

  async stopRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.STOPPED);
  }

  async uploadRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.UPLOADING);
  }

  async markUploaded(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.UPLOADED);
  }

  async startProcessing(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.PROCESSING);
  }

  async completeRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.COMPLETED);
  }

  async failRecording(id: string): Promise<RecordingSession> {
    return this.changeStatus(id, RecordingStatus.FAILED);
  }
}