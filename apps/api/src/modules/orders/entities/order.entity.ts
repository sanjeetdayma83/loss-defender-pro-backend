import {
  OrderPriority,
  OrderStatus,
  PackingStatus,
  VerificationStatus,
} from '@prisma/client';

export class OrderEntity {
  id: string;

  orderNumber: string;

  companyId: string;

  warehouseId?: string | null;

  customerId?: string | null;

  marketplace: string;

  marketplaceOrderId?: string | null;

  status: OrderStatus;

  priority: OrderPriority;

  packingStatus: PackingStatus;

  verificationStatus: VerificationStatus;

  assignedTo?: string | null;

  trackingNumber?: string | null;

  courier?: string | null;

  items?: Record<string, unknown>[] | null;

  customer?: Record<string, unknown> | null;

  shippingAddress?: Record<string, unknown> | null;

  recordingId?: string | null;

  evidenceId?: string | null;

  claimId?: string | null;

  returnId?: string | null;

  remarks?: string | null;

  metadata?: Record<string, unknown> | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;

  isDeleted: boolean;
}
