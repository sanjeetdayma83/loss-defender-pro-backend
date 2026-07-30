import { Type } from 'class-transformer';

import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import {
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

export class ReturnQueryDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  claimId?: string;

  @IsOptional()
  @IsUUID()
  recordingId?: string;

  @IsOptional()
  @IsUUID()
  evidenceId?: string;

  @IsOptional()
  @IsUUID()
  aiJobId?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  marketplace?: string;

  @IsOptional()
  @IsString()
  returnNumber?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @IsOptional()
  @IsEnum(ReturnPriority)
  priority?: ReturnPriority;

  @IsOptional()
  @IsEnum(ReturnResolutionType)
  resolutionType?: ReturnResolutionType;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn([
    'returnNumber',
    'status',
    'priority',
    'marketplace',
    'refundAmount',
    'createdAt',
    'updatedAt',
    'resolvedAt',
    'closedAt',
    'aiConfidence',
  ])
  sortBy:
    | 'returnNumber'
    | 'status'
    | 'priority'
    | 'marketplace'
    | 'refundAmount'
    | 'createdAt'
    | 'updatedAt'
    | 'resolvedAt'
    | 'closedAt'
    | 'aiConfidence' = 'createdAt';

  @IsOptional()
  @IsIn([
    'asc',
    'desc',
  ])
  sortOrder: 'asc' | 'desc' =
    'desc';
}