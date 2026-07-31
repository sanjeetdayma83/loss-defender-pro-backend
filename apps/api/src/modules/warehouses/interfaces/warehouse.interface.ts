import { Warehouse } from '@prisma/client';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

import {
  WarehouseDashboard,
  WarehouseStatistics,
} from '../types/warehouse.types';

export interface IWarehouseService {
  create(dto: CreateWarehouseDto): Promise<Warehouse>;

  update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse>;

  remove(id: string): Promise<Warehouse>;

  restore(id: string): Promise<Warehouse>;

  findById(id: string): Promise<Warehouse>;

  findAll(query: WarehouseQueryDto): Promise<any>;

  activate(id: string): Promise<Warehouse>;

  deactivate(id: string): Promise<Warehouse>;

  getStatistics(id: string): Promise<WarehouseStatistics>;

  getDashboard(id: string): Promise<WarehouseDashboard>;

  healthCheck(): Promise<boolean>;
}
