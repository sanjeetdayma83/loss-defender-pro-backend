import { Injectable } from '@nestjs/common';
import {
  Prisma,
  RecordingSession,
  RecordingStatus,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RecordingRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    data: Prisma.RecordingSessionCreateInput,
  ): Promise<RecordingSession> {
    return this.prisma.recordingSession.create({
      data,
    });
  }

  async findById(
    id: string,
  ): Promise<RecordingSession | null> {
    return this.prisma.recordingSession.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    args?: Prisma.RecordingSessionFindManyArgs,
  ): Promise<RecordingSession[]> {
    return this.prisma.recordingSession.findMany(
      args,
    );
  }

  async update(
    id: string,
    data: Prisma.RecordingSessionUpdateInput,
  ): Promise<RecordingSession> {
    return this.prisma.recordingSession.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: RecordingStatus,
    data: Prisma.RecordingSessionUpdateInput = {},
  ): Promise<RecordingSession> {
    return this.prisma.recordingSession.update({
      where: {
        id,
      },
      data: {
        status,
        ...data,
      },
    });
  }

  async softDelete(
    id: string,
  ): Promise<RecordingSession> {
    return this.prisma.recordingSession.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async count(
    where?: Prisma.RecordingSessionWhereInput,
  ): Promise<number> {
    return this.prisma.recordingSession.count({
      where,
    });
  }
}