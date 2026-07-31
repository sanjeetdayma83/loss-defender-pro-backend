import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import type {
  ScanDevice,
  ScanLocation,
  ScanResult,
} from '../types/scanner.types';

export class CreateScannerDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  barcodeType: string;

  @IsString()
  status: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  location: ScanLocation;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  device: ScanDevice;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  result: ScanResult;

  @IsString()
  scannedBy: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;

  @IsOptional()
  @IsString()
  evidenceId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}