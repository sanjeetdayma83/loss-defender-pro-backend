// src/modules/recordings/repositories/recording.repository.ts

import { Injectable } from '@nestjs/common';
import { Prisma, RecordingSession, RecordingStatus } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class RecordingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.RecordingSessionCreateInput,
  ): Promise<RecordingSession> {
    return this.prisma.recordingSession.create({
      data,
    });
  }

  async findById(id: string): Promise<RecordingSession | null> {
    return this.prisma.recordingSession.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    args?: Prisma.RecordingSessionFindManyArgs,
  ): Promise<RecordingSession[]> {
    return this.prisma.recordingSession.findMany(args);
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

  async softDelete(id: string): Promise<RecordingSession> {
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

  async count(where?: Prisma.RecordingSessionWhereInput): Promise<number> {
    return this.prisma.recordingSession.count({
      where,
    });
  }

  // -------------------------------------------------------
  // NEW HELPER METHODS
  // -------------------------------------------------------

  /**
   * Find Active Recording for an Order
   * Prevents two operators from recording the same order simultaneously.
   */
  async findActiveByOrder(orderId: string): Promise<RecordingSession | null> {
    return this.prisma.recordingSession.findFirst({
      where: {
        orderId,
        isDeleted: false,
        status: {
          in: [
            RecordingStatus.CREATED,
            RecordingStatus.STARTED,
            RecordingStatus.PAUSED,
            RecordingStatus.RESUMED,
          ],
        },
      },
    });
  }

  /**
   * Check if a recording session exists by ID
   */
  async exists(id: string): Promise<boolean> {
    return (
      (await this.prisma.recordingSession.count({
        where: {
          id,
          isDeleted: false,
        },
      })) > 0
    );
  }

  /**
   * Database health check validation
   */
  async healthCheck(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }

  /**
   * Execute operations within a Prisma transaction
   */
  transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(callback);
  }

  /**
   * Generic findMany utilizing full Prisma args
   */
  findMany(args: Prisma.RecordingSessionFindManyArgs) {
    return this.prisma.recordingSession.findMany(args);
  }
}