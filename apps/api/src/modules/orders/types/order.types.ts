import {
  OrderPriority,
  OrderStatus,
  PackingStatus,
  VerificationStatus,
} from '@prisma/client';

export interface OrderTimelineEvent {
  id: string;

  orderId: string;

  event: string;

  description: string;

  performedBy: string;

  createdAt: Date;
}

export interface OrderAuditLog {
  id: string;

  orderId: string;

  action: string;

  oldValue?: unknown;

  newValue?: unknown;

  performedBy: string;

  ipAddress?: string;

  userAgent?: string;

  createdAt: Date;
}

export interface OrderItem {
  sku: string;

  productId: string;

  productName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  barcode?: string;

  weight?: number;
}

export interface CustomerInformation {
  customerId?: string;

  name: string;

  email?: string;

  phone?: string;
}

export interface ShippingAddress {
  addressLine1: string;

  addressLine2?: string;

  city: string;

  state: string;

  postalCode: string;

  country: string;

  landmark?: string;
}

export interface WarehouseAssignment {
  warehouseId: string;

  warehouseName?: string;

  assignedTo?: string;

  assignedAt?: Date;
}

export interface PackingSummary {
  status: PackingStatus;

  packedBy?: string;

  startedAt?: Date;

  completedAt?: Date;

  totalItems: number;

  packedItems: number;

  remarks?: string;
}

export interface VerificationSummary {
  status: VerificationStatus;

  verifiedBy?: string;

  verifiedAt?: Date;

  aiConfidence?: number;

  recordingId?: string;

  evidenceId?: string;

  remarks?: string;
}

export interface MarketplaceMetadata {
  marketplace: string;

  marketplaceOrderId: string;

  shipmentId?: string;

  trackingNumber?: string;

  courier?: string;

  metadata?: Record<string, unknown>;
}

export interface OrderStatistics {
  total: number;

  created: number;

  assigned: number;

  packing: number;

  recording: number;

  verifying: number;

  shipped: number;

  delivered: number;

  cancelled: number;

  returned: number;

  claimed: number;
}

export interface OrderQueuePayload {
  orderId: string;

  companyId: string;

  warehouseId: string;

  priority: OrderPriority;

  status: OrderStatus;
}

export interface OrderSearchResult<T> {
  items: T[];

  total: number;

  page: number;

  limit: number;

  hasNext: boolean;

  hasPrevious: boolean;
}

export interface OrderFilter {
  companyId?: string;

  warehouseId?: string;

  assignedTo?: string;

  customerId?: string;

  marketplace?: string;

  status?: OrderStatus;

  priority?: OrderPriority;

  packingStatus?: PackingStatus;

  verificationStatus?: VerificationStatus;

  fromDate?: Date;

  toDate?: Date;
}
