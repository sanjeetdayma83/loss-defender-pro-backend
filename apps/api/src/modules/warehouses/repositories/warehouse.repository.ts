import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma, Warehouse } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

type CapacityJson = {
  utilizationPercentage?: number;
  totalZones?: number;
  totalRacks?: number;
  totalBins?: number;
  usedAreaSqFt?: number;
  totalAreaSqFt?: number;
};

@Injectable()
export class WarehouseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: WarehouseQueryDto): Prisma.WarehouseWhereInput {
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
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.prisma.warehouse.create({
      data: {
        companyId: dto.companyId,
        code: dto.warehouseCode,
        name: dto.warehouseName,
        warehouseType: dto.warehouseType,
        description: dto.description,
        timezone: dto.timezone,
        operatingHours: dto.operatingHours,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        isDefault: dto.isDefault ?? false,
        addressJson: dto.address as unknown as Prisma.InputJsonValue,
        location: dto.location as unknown as Prisma.InputJsonValue,
        manager: dto.manager as unknown as Prisma.InputJsonValue,
        capacity: dto.capacity as unknown as Prisma.InputJsonValue,
      } satisfies Prisma.WarehouseUncheckedCreateInput,
    });
  }

  async findById(id: string): Promise<Warehouse> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, isDeleted: false },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse ${id} not found.`);
    }

    return warehouse;
  }

  async findAll(query: WarehouseQueryDto) {
    const where = this.buildWhere(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const sortByRaw = query.sortBy ?? 'createdAt';
    const sortBy =
      sortByRaw === 'warehouseName'
        ? 'name'
        : sortByRaw === 'warehouseCode'
          ? 'code'
          : sortByRaw;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.warehouse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: query.sortOrder ?? 'desc',
        },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    await this.findById(id);

    const data: Prisma.WarehouseUncheckedUpdateInput = {};

    if (dto.warehouseCode !== undefined) data.code = dto.warehouseCode;
    if (dto.warehouseName !== undefined) data.name = dto.warehouseName;
    if (dto.warehouseType !== undefined) data.warehouseType = dto.warehouseType;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.timezone !== undefined) data.timezone = dto.timezone;
    if (dto.operatingHours !== undefined)
      data.operatingHours = dto.operatingHours;
    if (dto.contactEmail !== undefined) data.contactEmail = dto.contactEmail;
    if (dto.contactPhone !== undefined) data.contactPhone = dto.contactPhone;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;
    if (dto.address !== undefined) {
      data.addressJson = dto.address as unknown as Prisma.InputJsonValue;
    }
    if (dto.location !== undefined) {
      data.location = dto.location as unknown as Prisma.InputJsonValue;
    }
    if (dto.manager !== undefined) {
      data.manager = dto.manager as unknown as Prisma.InputJsonValue;
    }
    if (dto.capacity !== undefined) {
      data.capacity = dto.capacity as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.warehouse.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Warehouse> {
    await this.findById(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async activate(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { status: 'ACTIVE', isActive: true },
    });
  }

  async deactivate(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: { status: 'INACTIVE', isActive: false },
    });
  }

  async findByCompany(companyId: string): Promise<Warehouse[]> {
    return this.prisma.warehouse.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
  }

  async findByCode(warehouseCode: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findFirst({
      where: { code: warehouseCode, isDeleted: false },
    });
  }

  async getStatistics(id: string) {
    const warehouse = await this.findById(id);
    const cap = (warehouse.capacity ?? {}) as CapacityJson;

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      utilization: cap.utilizationPercentage ?? 0,
      totalZones: cap.totalZones ?? 0,
      totalRacks: cap.totalRacks ?? 0,
      totalBins: cap.totalBins ?? 0,
      usedArea: cap.usedAreaSqFt ?? 0,
      totalArea: cap.totalAreaSqFt ?? 0,
    };
  }

  async getDashboard(id: string) {
    const warehouse = await this.findById(id);
    const stats = await this.getStatistics(id);
    const cap = (warehouse.capacity ?? {}) as CapacityJson;

    return {
      warehouse,
      capacity: {
        totalAreaSqFt: cap.totalAreaSqFt ?? 0,
        usedAreaSqFt: cap.usedAreaSqFt ?? 0,
        totalRacks: cap.totalRacks ?? 0,
        totalBins: cap.totalBins ?? 0,
        totalZones: cap.totalZones ?? 0,
        utilizationPercentage: cap.utilizationPercentage ?? 0,
      },
      statistics: {
        totalOrders: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalWorkers: 0,
        totalScanners: 0,
        ...stats,
      },
    };
  }

  async updateCapacity(id: string, capacity: unknown): Promise<Warehouse> {
    await this.findById(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: { capacity: capacity as Prisma.InputJsonValue },
    });
  }

  async bulkActivate(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: { id: { in: ids } },
      data: { status: 'ACTIVE', isActive: true },
    });
  }

  async bulkDeactivate(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: { id: { in: ids } },
      data: { status: 'INACTIVE', isActive: false },
    });
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.warehouse.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async existsByCode(warehouseCode: string): Promise<boolean> {
    const count = await this.prisma.warehouse.count({
      where: { code: warehouseCode, isDeleted: false },
    });
    return count > 0;
  }

  async healthCheck(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }

  ping(): Promise<{ module: string; status: string; timestamp: Date }> {
    return Promise.resolve({
      module: 'WarehouseRepository',
      status: 'OK',
      timestamp: new Date(),
    });
  }

  count(where?: Prisma.WarehouseWhereInput) {
    return this.prisma.warehouse.count({ where });
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
    return this.prisma.warehouse.delete({ where: { id } });
  }

  transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(callback);
  }
}
