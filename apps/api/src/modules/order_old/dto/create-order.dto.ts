import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Marketplace, OrderStatus, VerificationStatus } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    enum: Marketplace,
    example: Marketplace.AMAZON,
  })
  @IsEnum(Marketplace)
  marketplace: Marketplace;

  @ApiPropertyOptional({
    example: '405-1234567-9876543',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marketplaceOrderId?: string;

  @ApiPropertyOptional({
    example: 'SHIP123456789',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  marketplaceShipmentId?: string;

  @ApiProperty({
    example: 'ORD-2026-000001',
  })
  @IsString()
  @MaxLength(100)
  orderNumber: string;

  @ApiProperty({
    example: 'WH-UUID',
  })
  @IsString()
  warehouseId: string;

  @ApiPropertyOptional({
    example: '123456789012',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  awbNumber?: string;

  @ApiPropertyOptional({
    example: 'Rahul Sharma',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  customerName?: string;

  @ApiPropertyOptional({
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiProperty({
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  expectedItemCount: number;

  @ApiPropertyOptional({
    example: 0,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  verifiedItemCount?: number;
}
