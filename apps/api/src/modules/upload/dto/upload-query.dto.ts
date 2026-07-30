import {
  Type,
} from 'class-transformer';

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
  UploadCategory,
  UploadStatus,
  UploadVisibility,
} from '@prisma/client';

export class UploadQueryDto {
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
  @IsEnum(UploadStatus)
  status?: UploadStatus;

  @IsOptional()
  @IsEnum(UploadCategory)
  category?: UploadCategory;

  @IsOptional()
  @IsEnum(UploadVisibility)
  visibility?: UploadVisibility;

  @IsOptional()
  @IsString()
  provider?: string;

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
  sortBy: keyof Record<
    | 'createdAt'
    | 'updatedAt'
    | 'uploadedAt'
    | 'originalName'
    | 'fileName'
    | 'status'
    | 'size',
    unknown
  > = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}