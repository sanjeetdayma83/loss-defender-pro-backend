import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { ReturnPriority, ReturnStatus } from '@prisma/client';

export class CreateReturnDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  orderId: string;

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

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  marketplace: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  marketplaceReturnId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  customerReason?: string;

  @IsOptional()
  @IsString()
  internalRemarks?: string;

  @IsOptional()
  @IsEnum(ReturnPriority)
  priority: ReturnPriority = ReturnPriority.MEDIUM;

  @IsOptional()
  @IsEnum(ReturnStatus)
  status: ReturnStatus = ReturnStatus.DRAFT;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  refundCurrency?: string;

  @IsOptional()
  @IsString()
  replacementOrderId?: string;

  @IsOptional()
  @IsString()
  replacementTrackingNumber?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
