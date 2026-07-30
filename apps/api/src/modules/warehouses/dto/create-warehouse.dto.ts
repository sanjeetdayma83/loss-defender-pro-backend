import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  WarehouseAddress,
  WarehouseCapacity,
  WarehouseLocation,
  WarehouseManager,
} from '../types/warehouse.types';

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  warehouseCode: string;

  @IsString()
  @IsNotEmpty()
  warehouseName: string;

  @IsString()
  warehouseType: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  address: WarehouseAddress;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  location: WarehouseLocation;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  manager: WarehouseManager;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  capacity: WarehouseCapacity;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  operatingHours?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}