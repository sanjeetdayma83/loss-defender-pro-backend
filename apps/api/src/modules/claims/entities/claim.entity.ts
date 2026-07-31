import {
  Claim,
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
  Prisma,
} from '@prisma/client';

export class ClaimEntity implements Claim {
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

  metadata: Prisma.JsonValue;

  resolutionData: Prisma.JsonValue;

  resolvedBy: string | null;

  resolvedAt: Date | null;

  closedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}