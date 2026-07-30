import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  AIProvider,
} from '@prisma/client';

export class CreateAiJobDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  warehouseId: string;

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

  @IsEnum(AIProvider)
  provider: AIProvider;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  jobType: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsObject()
  input: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<
    string,
    unknown
  >;
}