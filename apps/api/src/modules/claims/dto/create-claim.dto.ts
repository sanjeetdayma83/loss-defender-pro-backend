import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  ClaimPriority,
  ClaimStatus,
} from '@prisma/client';

export class CreateClaimDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  orderId: string;

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
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  customerRemarks?: string;

  @IsOptional()
  @IsString()
  internalRemarks?: string;

  @IsOptional()
  @IsEnum(ClaimPriority)
  priority: ClaimPriority = ClaimPriority.MEDIUM;

  @IsOptional()
  @IsEnum(ClaimStatus)
  status: ClaimStatus = ClaimStatus.DRAFT;

  @IsOptional()
  @IsObject()
  metadata?: Record<
    string,
    unknown
  >;
}