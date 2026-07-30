import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { Warehouse } from '@prisma/client';

import { WarehouseRepository } from '../repositories/warehouse.repository';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

import {
  IWarehouseService,
} from '../interfaces/warehouse.interface';

@Injectable()
export class WarehouseService
  implements IWarehouseService
{
  constructor(
    private readonly repository: WarehouseRepository,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(
    dto: CreateWarehouseDto,
  ): Promise<Warehouse> {
    const exists =
      await this.repository.existsByCode(
        dto.warehouseCode,
      );

    if (exists) {
      throw new ConflictException(
        'Warehouse code already exists.',
      );
    }

    return this.repository.create(dto);
  }

  /**
   * -------------------------------------------------------
   * READ
   * -------------------------------------------------------
   */

  async findAll(
    query: WarehouseQueryDto,
  ) {
    return this.repository.findAll(query);
  }

  async findById(
    id: string,
  ): Promise<Warehouse> {
    return this.repository.findById(id);
  }

  async findByCompany(
    companyId: string,
  ) {
    return this.repository.findByCompany(
      companyId,
    );
  }

  async findByCode(
    code: string,
  ) {
    return this.repository.findByCode(
      code,
    );
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
    return this.repository.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE
   * -------------------------------------------------------
   */

  async remove(
    id: string,
  ): Promise<Warehouse> {
    return this.repository.softDelete(
      id,
    );
  }

  async restore(
    id: string,
  ): Promise<Warehouse> {
    return this.repository.restore(id);
  }

  /**
   * -------------------------------------------------------
   * STATUS
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<Warehouse> {
    return this.repository.activate(id);
  }

  async deactivate(
    id: string,
  ): Promise<Warehouse> {
    return this.repository.deactivate(id);
  }

  /**
   * -------------------------------------------------------
   * CAPACITY
   * -------------------------------------------------------
   */

  async updateCapacity(
    id: string,
    capacity: any,
  ) {
    return this.repository.updateCapacity(
      id,
      capacity,
    );
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------------
   */

  async getStatistics(
    id: string,
  ) {
    return this.repository.getStatistics(
      id,
    );
  }

  async getDashboard(
    id: string,
  ) {
    return this.repository.getDashboard(
      id,
    );
  }
    /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkActivate(
    ids: string[],
  ) {
    return this.repository.bulkActivate(ids);
  }

  async bulkDeactivate(
    ids: string[],
  ) {
    return this.repository.bulkDeactivate(ids);
  }

  async bulkDelete(
    ids: string[],
  ) {
    return this.repository.bulkDelete(ids);
  }

  /**
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   */

  async existsByCode(
    warehouseCode: string,
  ) {
    return this.repository.existsByCode(
      warehouseCode,
    );
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  async ping() {
    return this.repository.ping();
  }

  /**
   * -------------------------------------------------------
   * GENERIC WRAPPERS
   * -------------------------------------------------------
   */

  count(where?: any) {
    return this.repository.count(where);
  }

  findMany(args: any) {
    return this.repository.findMany(args);
  }

  findFirst(args: any) {
    return this.repository.findFirst(args);
  }

  createMany(args: any) {
    return this.repository.createMany(args);
  }

  upsert(args: any) {
    return this.repository.upsert(args);
  }

  delete(id: string) {
    return this.repository.delete(id);
  }

  transaction<T>(
    callback: any,
  ): Promise<T> {
    return this.repository.transaction(
      callback,
    );
  }

  /**
   * -------------------------------------------------------
   * SERVICE INFORMATION
   * -------------------------------------------------------
   */

  getServiceInfo() {
    return {
      module: 'WarehouseService',
      version: '1.0.0',
      status: 'ACTIVE',
      features: [
        'CRUD',
        'Capacity Management',
        'Dashboard',
        'Statistics',
        'Bulk Operations',
        'Multi Company',
        'Soft Delete',
      ],
    };
  }
}