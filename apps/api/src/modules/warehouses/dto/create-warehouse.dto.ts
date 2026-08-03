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

import { WarehouseAddressDto } from './warehouse-address.dto';
import { WarehouseLocationDto } from './warehouse-location.dto';
import { WarehouseManagerDto } from './warehouse-manager.dto';
import { WarehouseCapacityDto } from './warehouse-capacity.dto';
import { Type } from 'class-transformer';

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
  @Type(() => WarehouseAddressDto)
  address: WarehouseAddressDto;

  @IsObject()
  @ValidateNested()
  @Type(() => WarehouseLocationDto)
  location: WarehouseLocationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => WarehouseManagerDto)
  manager: WarehouseManagerDto;

  @IsObject()
  @ValidateNested()
  @Type(() => WarehouseCapacityDto)
  capacity: WarehouseCapacityDto;

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