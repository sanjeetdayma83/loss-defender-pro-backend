import {
  Marketplace,
  OrderStatus,
  VerificationStatus,
} from '@prisma/client';

export interface OrderEntity {
  id: string;

  companyId: string;

  warehouseId: string;

  createdById: string;

  marketplace: Marketplace;

  marketplaceOrderId: string | null;

  marketplaceShipmentId: string | null;

  orderNumber: string;

  awbNumber: string | null;

  customerName: string | null;

  customerPhone: string | null;

  status: OrderStatus;

  verificationStatus: VerificationStatus;

  expectedItemCount: number;

  verifiedItemCount: number;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}