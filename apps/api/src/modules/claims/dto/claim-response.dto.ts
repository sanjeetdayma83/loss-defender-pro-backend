import {
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
} from '@prisma/client';

export class ClaimResponseDto {
  id: string;

  claimNumber: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  recordingId: string | null;

  evidenceId: string | null;

  aiJobId: string | null;

  assignedTo: string | null;

  status: ClaimStatus;

  priority: ClaimPriority;

  resolutionType: ClaimResolutionType | null;

  title: string;

  description: string;

  customerRemarks: string | null;

  internalRemarks: string | null;

  aiSummary: string | null;

  aiConfidence: number;

  aiRecommendation: string | null;

  metadata: Record<string, unknown> | null;

  resolutionData: Record<string, unknown> | null;

  resolvedBy: string | null;

  resolvedAt: Date | null;

  closedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
