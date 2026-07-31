import {
  WarehouseAddress,
  WarehouseCapacity,
  WarehouseLocation,
  WarehouseManager,
} from '../types/warehouse.types';

export class WarehouseEntity {
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

  isDeleted: boolean;

  createdBy?: string;

  updatedBy?: string;

  deletedBy?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;
}
