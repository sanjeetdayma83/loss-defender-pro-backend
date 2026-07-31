import { Injectable } from '@nestjs/common';

import {
  AIJob,
  AIJobStatus,
  AIProvider,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateAiJobDto } from '../dto/create-ai-job.dto';
import { UpdateAiJobDto } from '../dto/update-ai-job.dto';
import { AiQueryDto } from '../dto/ai-query.dto';

@Injectable()
export class AiRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(dto: CreateAiJobDto): Promise<AIJob> {
    return this.prisma.aIJob.create({
      data: {
        companyId: dto.companyId,
        warehouseId: dto.warehouseId,
        orderId: dto.orderId,
        recordingId: dto.recordingId,
        evidenceId: dto.evidenceId,
        uploadId: dto.uploadId,
        provider: this.normalizeProvider(dto.provider ?? 'OPENAI'),
        model: dto.model ?? 'default',
        prompt: dto.prompt ?? '',
        jobType: dto.jobType ?? 'ANALYSIS',
        input: (dto.input ?? {}) as Prisma.InputJsonValue,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        status: AIJobStatus.PENDING,
      } satisfies Prisma.AIJobUncheckedCreateInput,
    });
  }

  async findById(id: string): Promise<AIJob | null> {
    return this.prisma.aIJob.findFirst({
      where: { id },
    });
  }

  async findMany(query: AiQueryDto): Promise<AIJob[]> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', ...filters } =
      query;

    return this.prisma.aIJob.findMany({
      where: this.buildWhere(filters),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async count(query: AiQueryDto): Promise<number> {
    const { page, limit, sortBy, sortOrder, ...filters } = query;
    return this.prisma.aIJob.count({
      where: this.buildWhere(filters),
    });
  }

  async update(id: string, dto: UpdateAiJobDto): Promise<AIJob> {
    const data: Prisma.AIJobUncheckedUpdateInput = {};

    if (dto.provider !== undefined) {
      data.provider = this.normalizeProvider(dto.provider);
    }
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.prompt !== undefined) data.prompt = dto.prompt;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.orderId !== undefined) data.orderId = dto.orderId;
    if (dto.recordingId !== undefined) data.recordingId = dto.recordingId;
    if (dto.evidenceId !== undefined) data.evidenceId = dto.evidenceId;
    if (dto.uploadId !== undefined) data.uploadId = dto.uploadId;
    if (dto.input !== undefined) {
      data.input = dto.input as Prisma.InputJsonValue;
    }
    if (dto.metadata !== undefined) {
      data.metadata = dto.metadata as Prisma.InputJsonValue;
    }
    if (dto.error !== undefined) data.error = dto.error;

    return this.prisma.aIJob.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: AIJobStatus): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: { id },
      data: { status },
    });
  }

  async markStarted(id: string): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: { id },
      data: { status: AIJobStatus.PROCESSING },
    });
  }

  async markCompleted(
    id: string,
    output: Prisma.JsonValue,
    confidence: number,
    processingTime: number,
    tokensUsed?: number,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: AIJobStatus.COMPLETED,
        output: (output ?? Prisma.DbNull) as Prisma.InputJsonValue,
        confidence,
        processingTime,
        tokensUsed,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: { id },
      data: {
        status: AIJobStatus.FAILED,
        error,
      },
    });
  }

  async softDelete(id: string): Promise<AIJob> {
    return this.prisma.aIJob.delete({
      where: { id },
    });
  }

  private buildWhere(
    filters: Partial<AiQueryDto>,
  ): Prisma.AIJobWhereInput {
    const where: Prisma.AIJobWhereInput = {};

    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.uploadId) where.uploadId = filters.uploadId;
    if (filters.recordingId) where.recordingId = filters.recordingId;
    if (filters.evidenceId) where.evidenceId = filters.evidenceId;
    if (filters.status) where.status = filters.status as AIJobStatus;
    if (filters.provider) {
      where.provider = this.normalizeProvider(filters.provider);
    }

    return where;
  }

  private normalizeProvider(provider?: string | AIProvider): AIProvider {
  return String(provider ?? 'OPENAI').toUpperCase() as AIProvider;
}
}