import {
  WarehouseAddress,
  WarehouseCapacity,
  WarehouseLocation,
  WarehouseManager,
} from '../types/warehouse.types';

export class WarehouseResponseDto {
  id: string;

  companyId: string;

  warehouseCode: string;

  warehouseName: string;

  warehouseType: string;

  status: string;

  description?: string;

  address: WarehouseAddress;

  location: WarehouseLocation;

  manager: WarehouseManager;

  capacity: WarehouseCapacity;

  timezone: string;

  operatingHours?: string;

  contactEmail?: string;

  contactPhone?: string;

  isDefault: boolean;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;
}
