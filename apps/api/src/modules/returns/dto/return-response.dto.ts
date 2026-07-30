import {
  ReturnPriority,
  ReturnResolutionType,
  ReturnStatus,
} from '@prisma/client';

export class ReturnResponseDto {
  id: string;

  returnNumber: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  claimId: string | null;

  recordingId: string | null;

  evidenceId: string | null;

  aiJobId: string | null;

  assignedTo: string | null;

  marketplace: string;

  marketplaceReturnId: string | null;

  status: ReturnStatus;

  priority: ReturnPriority;

  resolutionType: ReturnResolutionType | null;

  title: string;

  description: string;

  customerReason: string | null;

  internalRemarks: string | null;

  aiSummary: string | null;

  aiConfidence: number;

  aiRecommendation: string | null;

  refundAmount: number | null;

  refundCurrency: string | null;

  replacementOrderId: string | null;

  replacementTrackingNumber: string | null;

  metadata: Record<
    string,
    unknown
  > | null;

  resolutionData: Record<
    string,
    unknown
  > | null;

  resolvedBy: string | null;

  resolvedAt: Date | null;

  closedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}