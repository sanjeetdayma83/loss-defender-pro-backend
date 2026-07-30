import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { ReportDateRange } from '../types/reports.types';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsString()
  @IsNotEmpty()
  reportType: string;

  @IsString()
  @IsNotEmpty()
  reportName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  dateRange: ReportDateRange;

  @IsString()
  @IsNotEmpty()
  generatedBy: string;

  @IsString()
  @IsNotEmpty()
  exportFormat: string;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  scheduleCron?: string;
}