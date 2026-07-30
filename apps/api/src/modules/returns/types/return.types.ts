import {
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

export interface ReturnTimelineEvent {
  id: string;
  returnId: string;
  event: string;
  description: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ReturnAuditLog {
  id: string;
  returnId: string;
  action: string;
  userId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ReturnEvidenceSummary {
  totalEvidence: number;
  totalImages: number;
  totalVideos: number;
  totalDocuments: number;
  recordingAvailable: boolean;
  aiVerified: boolean;
  evidenceScore: number;
}

export interface ReturnAIAnalysis {
  provider: string;
  confidence: number;
  summary: string;
  recommendation: string;
  detectedIssues: string[];
  fraudProbability: number;
  metadata?: Record<string, unknown>;
}

export interface RefundDetails {
  amount: number;
  currency: string;
  transactionId?: string;
  paymentMethod?: string;
  refundedBy?: string;
  refundedAt?: Date;
}

export interface ReplacementDetails {
  replacementOrderId: string;
  shipmentId?: string;
  courierName?: string;
  trackingNumber?: string;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export interface ReturnStatistics {
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  rejectedReturns: number;
  refundedReturns: number;
  replacedReturns: number;
  closedReturns: number;
  averageResolutionTime: number;
}

export interface ReturnQueuePayload {
  returnId: string;
  companyId: string;
  warehouseId: string;
  priority: ReturnPriority;
}

export interface ReturnNotificationPayload {
  returnId: string;
  companyId: string;
  recipientId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ReturnSearchResult {
  items: unknown[];
  total: number;
  page: number;
  limit: number;
}

export interface ReturnFilter {
  companyId?: string;
  warehouseId?: string;
  orderId?: string;
  recordingId?: string;
  evidenceId?: string;
  claimId?: string;
  aiJobId?: string;
  assignedTo?: string;
  marketplace?: string;
  status?: ReturnStatus;
  priority?: ReturnPriority;
  resolutionType?: ReturnResolutionType;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}