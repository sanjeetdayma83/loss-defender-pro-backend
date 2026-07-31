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
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
} from '@prisma/client';

export class ClaimQueryDto {
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
  claimNumber?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsEnum(ClaimPriority)
  priority?: ClaimPriority;

  @IsOptional()
  @IsEnum(ClaimResolutionType)
  resolutionType?: ClaimResolutionType;

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
    'claimNumber',
    'status',
    'priority',
    'createdAt',
    'updatedAt',
    'resolvedAt',
    'closedAt',
    'aiConfidence',
  ])
  sortBy:
    | 'claimNumber'
    | 'status'
    | 'priority'
    | 'createdAt'
    | 'updatedAt'
    | 'resolvedAt'
    | 'closedAt'
    | 'aiConfidence' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}
