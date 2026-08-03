// src/modules/orders/dto/create-order.dto.ts

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
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

// --------------------------------------------------------
// Nested DTOs for JSON fields
// --------------------------------------------------------

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class OrderCustomerDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class OrderShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

// --------------------------------------------------------
// Main Create Order DTO
// --------------------------------------------------------

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  createdById: string;

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
  verificationStatus: VerificationStatus = VerificationStatus.PENDING;

  // Validate array of items
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // Validate nested customer object
  @ValidateNested()
  @Type(() => OrderCustomerDto)
  customer: OrderCustomerDto;

  // Validate nested shipping object
  @ValidateNested()
  @Type(() => OrderShippingAddressDto)
  shippingAddress: OrderShippingAddressDto;

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

  // Metadata can remain arbitrary Record if you expect unpredictable shapes here
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}