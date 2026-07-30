import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Marketplace,
  OrderStatus,
  VerificationStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class OrderQueryDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({
    description: 'Search by order number, marketplace order ID, AWB or customer name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: Marketplace,
  })
  @IsOptional()
  @IsEnum(Marketplace)
  marketplace?: Marketplace;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    enum: VerificationStatus,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({
    example: '2026-07-01',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @Transform(({ value }) =>
    String(value).toLowerCase(),
  )
  sortOrder: 'asc' | 'desc' = 'desc';
}