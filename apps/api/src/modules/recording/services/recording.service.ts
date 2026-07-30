import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RecordingSession,
  RecordingStatus,
} from '@prisma/client';

import { RecordingRepository } from '../repositories/recording.repository';
import { CreateRecordingDto } from '../dto/create-recording.dto';
import { UpdateRecordingDto } from '../dto/update-recording.dto';
import { RecordingQueryDto } from '../dto/recording-query.dto';
import { RecordingStateMachine } from '../utils/recording-state-machine';

@Injectable()
export class RecordingService {
  constructor(
    private readonly recordingRepository: RecordingRepository,
    private readonly stateMachine: RecordingStateMachine,
  ) {}

  async create(
    dto: CreateRecordingDto,
  ): Promise<RecordingSession> {
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

  async findById(
    id: string,
  ): Promise<RecordingSession> {
    const recording =
      await this.recordingRepository.findById(id);

    if (!recording) {
      throw new NotFoundException(
        'Recording not found',
      );
    }

    return recording;
  }

  async findAll(
    query: RecordingQueryDto,
  ): Promise<RecordingSession[]> {
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

  async update(
    id: string,
    dto: UpdateRecordingDto,
  ): Promise<RecordingSession> {
    await this.findById(id);

    return this.recordingRepository.update(id, dto);
  }

  async delete(
    id: string,
  ): Promise<RecordingSession> {
    await this.findById(id);

    return this.recordingRepository.softDelete(id);
  }

  async changeStatus(
    id: string,
    status: RecordingStatus,
  ): Promise<RecordingSession> {
    const recording = await this.findById(id);

    this.stateMachine.validateTransition(
      recording.status,
      status,
    );

    return this.recordingRepository.updateStatus(
      id,
      status,
    );
  }

  async startRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.STARTED,
    );
  }

  async pauseRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.PAUSED,
    );
  }

  async resumeRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.RESUMED,
    );
  }

  async stopRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.STOPPED,
    );
  }

  async uploadRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.UPLOADING,
    );
  }

  async markUploaded(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.UPLOADED,
    );
  }

  async startProcessing(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.PROCESSING,
    );
  }

  async completeRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.COMPLETED,
    );
  }

  async failRecording(
    id: string,
  ): Promise<RecordingSession> {
    return this.changeStatus(
      id,
      RecordingStatus.FAILED,
    );
  }
}