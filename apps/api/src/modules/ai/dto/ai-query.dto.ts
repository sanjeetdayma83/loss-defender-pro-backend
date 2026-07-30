import { Type } from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

import {
  AIJobStatus,
  AIProvider,
} from '@prisma/client';

export class AiQueryDto {
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
  uploadId?: string;

  @IsOptional()
  @IsUUID()
  recordingId?: string;

  @IsOptional()
  @IsUUID()
  evidenceId?: string;

  @IsOptional()
  @IsEnum(AIProvider)
  provider?: AIProvider;

  @IsOptional()
  @IsEnum(AIJobStatus)
  status?: AIJobStatus;

  @IsOptional()
  @IsString()
  jobType?: string;

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
  @IsString()
  sortBy:
    | 'createdAt'
    | 'updatedAt'
    | 'startedAt'
    | 'completedAt'
    | 'confidence'
    | 'processingTime'
    | 'status'
    | 'provider' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}