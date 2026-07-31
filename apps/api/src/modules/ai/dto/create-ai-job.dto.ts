import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { AIJobStatus, AIProvider } from '@prisma/client';

export class CreateAiJobDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @IsUUID()
  @IsNotEmpty()
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

  @IsOptional()
  @IsUUID()
  uploadId?: string;

  @IsOptional()
  @IsEnum(AIProvider)
  provider?: AIProvider;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  jobType?: string;

  @IsOptional()
  @IsObject()
  input?: Record<string, unknown>;

  /** @deprecated use input/output on the model — kept for compat */
  @IsOptional()
  response?: unknown;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AIJobStatus)
  status?: AIJobStatus;

  @IsOptional()
  @IsString()
  error?: string;
}