import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.order.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async findByOrderNumber(
    companyId: string,
    orderNumber: string,
  ) {
    return this.prisma.order.findFirst({
      where: {
        companyId,
        orderNumber,
        isDeleted: false,
      },
    });
  }

  async findByMarketplaceOrderId(
    companyId: string,
    marketplaceOrderId: string,
  ) {
    return this.prisma.order.findFirst({
      where: {
        companyId,
        marketplaceOrderId,
        isDeleted: false,
      },
    });
  }

  async exists(
    companyId: string,
    orderNumber: string,
  ): Promise<boolean> {
    const order =
      await this.prisma.order.findFirst({
        where: {
          companyId,
          orderNumber,
          isDeleted: false,
        },
        select: {
          id: true,
        },
      });

    return order !== null;
  }

  async update(
    id: string,
    data: Prisma.OrderUpdateInput,
  ) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async findMany(
    args?: Prisma.OrderFindManyArgs,
  ) {
    return this.prisma.order.findMany(args);
  }

  async count(
    where?: Prisma.OrderWhereInput,
  ) {
    return this.prisma.order.count({
      where,
    });
  }

  async transaction<T>(
    callback: (
      tx: Prisma.TransactionClient,
    ) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}