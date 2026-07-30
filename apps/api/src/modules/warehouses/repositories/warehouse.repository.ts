import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  Warehouse,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

@Injectable()
export class WarehouseRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * -------------------------------------------------------
   * BUILD WHERE
   * -------------------------------------------------------
   */

  private buildWhere(
    query: WarehouseQueryDto,
  ): Prisma.WarehouseWhereInput {
    const where: Prisma.WarehouseWhereInput = {
      isDeleted: false,
    };

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.warehouseType = query.type;
    }

    if (query.search) {
      where.OR = [
        {
          warehouseName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          warehouseCode: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(
    dto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.create({
      data:
        dto as Prisma.WarehouseCreateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<Warehouse> {
    const warehouse =
      await this.prisma.warehouse.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    if (!warehouse) {
      throw new NotFoundException(
        `Warehouse ${id} not found.`,
      );
    }

    return warehouse;
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(
    query: WarehouseQueryDto,
  ) {
    const where =
      this.buildWhere(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] =
      await this.prisma.$transaction([
        this.prisma.warehouse.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [query.sortBy ??
              'createdAt']:
              query.sortOrder ??
              'desc',
          },
        }),
        this.prisma.warehouse.count({
          where,
        }),
      ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    await this.findById(id);

    return this.prisma.warehouse.update({
      where: { id },
      data:
        dto as Prisma.WarehouseUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * SOFT DELETE
   * -------------------------------------------------------
   */

  async softDelete(
    id: string,
  ): Promise<Warehouse> {
    await this.findById(id);

    return this.prisma.warehouse.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RESTORE
   * -------------------------------------------------------
   */

  async restore(
    id: string,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ACTIVATE
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DEACTIVATE
   * -------------------------------------------------------
   */

  async deactivate(
    id: string,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY COMPANY
   * -------------------------------------------------------
   */

  async findByCompany(
    companyId: string,
  ): Promise<Warehouse[]> {
    return this.prisma.warehouse.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      orderBy: {
        warehouseName: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY CODE
   * -------------------------------------------------------
   */

  async findByCode(
    warehouseCode: string,
  ): Promise<Warehouse | null> {
    return this.prisma.warehouse.findFirst({
      where: {
        warehouseCode,
        isDeleted: false,
      },
    });
  }
    /**
   * -------------------------------------------------------
   * DASHBOARD / STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(id: string) {
    const warehouse = await this.findById(id);

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.warehouseName,
      utilization:
        warehouse.capacity?.utilizationPercentage ?? 0,
      totalZones:
        warehouse.capacity?.totalZones ?? 0,
      totalRacks:
        warehouse.capacity?.totalRacks ?? 0,
      totalBins:
        warehouse.capacity?.totalBins ?? 0,
      usedArea:
        warehouse.capacity?.usedAreaSqFt ?? 0,
      totalArea:
        warehouse.capacity?.totalAreaSqFt ?? 0,
    };
  }

  async getDashboard(id: string) {
    const warehouse = await this.findById(id);

    return {
      warehouse,
      statistics: await this.getStatistics(id),
    };
  }

  /**
   * -------------------------------------------------------
   * CAPACITY
   * -------------------------------------------------------
   */

  async updateCapacity(
    id: string,
    capacity: any,
  ): Promise<Warehouse> {
    await this.findById(id);

    return this.prisma.warehouse.update({
      where: { id },
      data: { capacity },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkActivate(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  async bulkDeactivate(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   */

  async existsByCode(
    warehouseCode: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.warehouse.count({
        where: {
          warehouseCode,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }

  async ping() {
    return {
      module: 'WarehouseRepository',
      status: 'OK',
      timestamp: new Date(),
    };
  }

  /**
   * -------------------------------------------------------
   * GENERIC HELPERS
   * -------------------------------------------------------
   */

  count(where?: Prisma.WarehouseWhereInput) {
    return this.prisma.warehouse.count({
      where,
    });
  }

  findMany(args: Prisma.WarehouseFindManyArgs) {
    return this.prisma.warehouse.findMany(args);
  }

  findFirst(args: Prisma.WarehouseFindFirstArgs) {
    return this.prisma.warehouse.findFirst(args);
  }

  createMany(args: Prisma.WarehouseCreateManyArgs) {
    return this.prisma.warehouse.createMany(args);
  }

  upsert(args: Prisma.WarehouseUpsertArgs) {
    return this.prisma.warehouse.upsert(args);
  }

  delete(id: string) {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  transaction<T>(
    callback: (
      tx: Prisma.TransactionClient,
    ) => Promise<T>,
  ) {
    return this.prisma.$transaction(callback);
  }
}