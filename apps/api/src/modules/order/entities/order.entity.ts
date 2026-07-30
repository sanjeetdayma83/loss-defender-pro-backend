import { ApiProperty } from '@nestjs/swagger';
import {
  Marketplace,
  OrderStatus,
  VerificationStatus,
} from '@prisma/client';

export class Order {
  @ApiProperty({
    example: 'd8d4d4f4-0d3e-4d80-a7e4-b90b40f8d321',
  })
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  createdById: string;

  @ApiProperty({
    enum: Marketplace,
  })
  marketplace: Marketplace;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  marketplaceOrderId: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  marketplaceShipmentId: string | null;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  awbNumber: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  customerName: string | null;

  @ApiProperty({
    required: false,
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

  @ApiProperty({
    example: 5,
  })
  expectedItemCount: number;

  @ApiProperty({
    example: 3,
  })
  verifiedItemCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty()
  isDeleted: boolean;
}