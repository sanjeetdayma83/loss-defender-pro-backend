import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WarehouseCreateInput) {
    return this.prisma.warehouse.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.warehouse.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });
  }

  async findByCode(companyId: string, code: string) {
    return this.prisma.warehouse.findFirst({
      where: {
        companyId,
        code,
        isDeleted: false,
      },
    });
  }

  async exists(companyId: string, code: string): Promise<boolean> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        companyId,
        code,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    return warehouse !== null;
  }

  async update(id: string, data: Prisma.WarehouseUpdateInput) {
    return this.prisma.warehouse.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.warehouse.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async findMany(args?: Prisma.WarehouseFindManyArgs) {
    return this.prisma.warehouse.findMany(args);
  }

  async count(where?: Prisma.WarehouseWhereInput) {
    return this.prisma.warehouse.count({
      where,
    });
  }
}