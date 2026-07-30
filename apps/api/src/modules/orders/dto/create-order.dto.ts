import {
  OrderPriority,
  OrderStatus,
  PackingStatus,
  VerificationStatus,
} from '@prisma/client';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  marketplace: string;

  @IsOptional()
  @IsString()
  marketplaceOrderId?: string;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority: OrderPriority = OrderPriority.MEDIUM;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus = OrderStatus.CREATED;

  @IsOptional()
  @IsEnum(PackingStatus)
  packingStatus: PackingStatus = PackingStatus.PENDING;

  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus: VerificationStatus =
    VerificationStatus.PENDING;

  @IsArray()
  items: Record<string, unknown>[];

  @IsObject()
  customer: Record<string, unknown>;

  @IsObject()
  shippingAddress: Record<string, unknown>;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  courier?: string;

  @IsOptional()
  @IsString()
  recordingId?: string;

  @IsOptional()
  @IsString()
  evidenceId?: string;

  @IsOptional()
  @IsString()
  claimId?: string;

  @IsOptional()
  @IsString()
  returnId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}