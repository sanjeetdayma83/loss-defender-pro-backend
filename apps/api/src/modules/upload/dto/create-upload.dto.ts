import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { UploadCategory, UploadVisibility } from '@prisma/client';

export class CreateUploadDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  warehouseId: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  recordingId?: string;

  @IsOptional()
  @IsUUID()
  evidenceId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  extension: string;

  @IsEnum(UploadCategory)
  category: UploadCategory;

  @IsOptional()
  @IsEnum(UploadVisibility)
  visibility?: UploadVisibility;

  @IsString()
  @IsNotEmpty()
  checksum: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
