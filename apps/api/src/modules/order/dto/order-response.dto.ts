import { ApiProperty } from '@nestjs/swagger';
import {
  Marketplace,
  OrderStatus,
  VerificationStatus,
} from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  warehouseName: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty()
  createdByName: string;

  @ApiProperty({
    enum: Marketplace,
  })
  marketplace: Marketplace;

  @ApiProperty({
    nullable: true,
  })
  marketplaceOrderId: string | null;

  @ApiProperty({
    nullable: true,
  })
  marketplaceShipmentId: string | null;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({
    nullable: true,
  })
  awbNumber: string | null;

  @ApiProperty({
    nullable: true,
  })
  customerName: string | null;

  @ApiProperty({
    nullable: true,
  })
  customerPhone: string | null;

  @ApiProperty({
    enum: OrderStatus,
  })
  status: OrderStatus;

  @ApiProperty({
    enum: VerificationStatus,
  })
  verificationStatus: VerificationStatus;

  @ApiProperty()
  expectedItemCount: number;

  @ApiProperty()
  verifiedItemCount: number;

  @ApiProperty({
    example: 60,
    description: 'Verification progress percentage',
  })
  verificationProgress: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}