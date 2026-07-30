import {
  Injectable,
} from '@nestjs/common';

import {
  AIJob,
  AIJobStatus,
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

  async create(
    dto: CreateAiJobDto,
  ): Promise<AIJob> {
    return this.prisma.aIJob.create({
      data: dto as Prisma.AIJobCreateInput,
    });
  }

  async findById(
    id: string,
  ): Promise<AIJob | null> {
    return this.prisma.aIJob.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async findMany(
    query: AiQueryDto,
  ): Promise<AIJob[]> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    } = query;

    return this.prisma.aIJob.findMany({
      where: {
        ...filters,
        isDeleted: false,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async count(
    query: AiQueryDto,
  ): Promise<number> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    } = query;

    return this.prisma.aIJob.count({
      where: {
        ...filters,
        isDeleted: false,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateAiJobDto,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async updateStatus(
    id: string,
    status: AIJobStatus,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async markStarted(
    id: string,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: {
        id,
      },
      data: {
        status:
          AIJobStatus.PROCESSING,
        startedAt: new Date(),
      },
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
      where: {
        id,
      },
      data: {
        status:
          AIJobStatus.COMPLETED,
        output,
        confidence,
        processingTime,
        tokensUsed,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: {
        id,
      },
      data: {
        status:
          AIJobStatus.FAILED,
        error,
        completedAt: new Date(),
      },
    });
  }

  async softDelete(
    id: string,
  ): Promise<AIJob> {
    return this.prisma.aIJob.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}