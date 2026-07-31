import { Injectable } from '@nestjs/common';

import {
  Prisma,
  Return,
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';
import { CreateReturnDto } from '../dto/create-return.dto';
import { ReturnQueryDto } from '../dto/return-query.dto';
import { UpdateReturnDto } from '../dto/update-return.dto';

@Injectable()
export class ReturnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateReturnDto & { returnNumber: string },
  ): Promise<Return> {
    return this.prisma.return.create({
      data: {
        returnNumber: data.returnNumber,
        companyId: data.companyId,
        warehouseId: data.warehouseId,
        orderId: data.orderId,
        recordingId: data.recordingId,
        marketplace: data.marketplace,
        marketplaceReturnId: data.marketplaceReturnId,
        evidenceId: data.evidenceId,
        aiJobId: data.aiJobId,
        assignedTo: data.assignedTo,
        status: data.status,
        priority: data.priority,
        title: data.title,
        description: data.description,
        customerReason: data.customerReason,
        internalRemarks: data.internalRemarks,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async findById(id: string): Promise<Return | null> {
    return this.prisma.return.findUnique({
      where: { id },
    });
  }

  async findByReturnNumber(returnNumber: string): Promise<Return | null> {
    return this.prisma.return.findUnique({
      where: { returnNumber },
    });
  }

  async update(id: string, data: UpdateReturnDto): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        warehouseId: data.warehouseId,
        orderId: data.orderId,
        recordingId: data.recordingId,
        evidenceId: data.evidenceId,
        aiJobId: data.aiJobId,
        assignedTo: data.assignedTo,
        status: data.status,
        priority: data.priority,
        title: data.title,
        description: data.description,
        customerReason: data.customerReason,
        internalRemarks: data.internalRemarks,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: { status },
    });
  }

  async updatePriority(id: string, priority: ReturnPriority): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: { priority },
    });
  }

  async assign(id: string, assignedTo: string): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: { assignedTo },
    });
  }

  async processRefund(
    id: string,
    resolutionType: ReturnResolutionType,
    resolvedBy: string,
    refundAmount: number,
    refundCurrency: string,
    resolutionData?: Prisma.JsonValue,
  ): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        status: ReturnStatus.REFUNDED,
        resolutionType,
        resolvedBy,
        resolvedAt: new Date(),
        refundAmount,
        refundCurrency,
        resolutionData:
          resolutionData == null
            ? Prisma.DbNull
            : (resolutionData as Prisma.InputJsonValue),
      },
    });
  }

  async processReplacement(
    id: string,
    resolutionType: ReturnResolutionType,
    resolvedBy: string,
    replacementOrderId: string,
    replacementTrackingNumber?: string,
    resolutionData?: Prisma.JsonValue,
  ): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        status: ReturnStatus.REPLACED,
        resolutionType,
        resolvedBy,
        resolvedAt: new Date(),
        replacementOrderId,
        replacementTrackingNumber,
        resolutionData:
          resolutionData == null
            ? Prisma.DbNull
            : (resolutionData as Prisma.InputJsonValue),
      },
    });
  }

  async close(id: string): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        status: ReturnStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  async softDelete(id: string): Promise<Return> {
    return this.prisma.return.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async count(where: Prisma.ReturnWhereInput = {}): Promise<number> {
    return this.prisma.return.count({ where });
  }

  async findAll(query: ReturnQueryDto): Promise<Return[]> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate,
      ...filters
    } = query;

    const where: Prisma.ReturnWhereInput = {
      isDeleted: false,
      ...filters,
    };

    if (search) {
      where.OR = [
        {
          returnNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    return this.prisma.return.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async statistics() {
    const [total, pending, approved, refunded, replaced, rejected, closed] =
      await Promise.all([
        this.prisma.return.count({ where: { isDeleted: false } }),
        this.prisma.return.count({
          where: { status: ReturnStatus.UNDER_REVIEW, isDeleted: false },
        }),
        this.prisma.return.count({
          where: { status: ReturnStatus.APPROVED, isDeleted: false },
        }),
        this.prisma.return.count({
          where: { status: ReturnStatus.REFUNDED, isDeleted: false },
        }),
        this.prisma.return.count({
          where: { status: ReturnStatus.REPLACED, isDeleted: false },
        }),
        this.prisma.return.count({
          where: { status: ReturnStatus.REJECTED, isDeleted: false },
        }),
        this.prisma.return.count({
          where: { status: ReturnStatus.CLOSED, isDeleted: false },
        }),
      ]);

    return {
      total,
      pending,
      approved,
      refunded,
      replaced,
      rejected,
      closed,
    };
  }
}
