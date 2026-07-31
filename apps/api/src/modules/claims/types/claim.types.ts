import {
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
} from '@prisma/client';

export interface ClaimTimelineEvent {
  id: string;

  type: string;

  title: string;

  description?: string;

  createdAt: Date;

  createdBy: string;

  metadata?: Record<string, unknown>;
}

export interface ClaimAuditLog {
  id: string;

  claimId: string;

  action: string;

  performedBy: string;

  performedAt: Date;

  previousState?: ClaimStatus;

  currentState: ClaimStatus;

  metadata?: Record<string, unknown>;
}

export interface ClaimEvidenceSummary {
  evidenceId: string;

  confidence: number;

  aiVerified: boolean;

  uploadCount: number;

  imageCount: number;

  videoCount: number;
}

export interface ClaimAIAnalysis {
  confidence: number;

  recommendation: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';

  summary: string;

  detectedIssues: string[];

  metadata?: Record<string, unknown>;
}

export interface ClaimResolution {
  type: ClaimResolutionType;

  remarks?: string;

  resolvedBy: string;

  resolvedAt: Date;

  metadata?: Record<string, unknown>;
}

export interface ClaimStatistics {
  total: number;

  draft: number;

  open: number;

  underReview: number;

  resolved: number;

  rejected: number;

  closed: number;

  cancelled: number;

  averageResolutionTime: number;

  averageConfidence: number;
}

export interface ClaimQueuePayload {
  claimId: string;

  companyId: string;

  warehouseId: string;

  priority: ClaimPriority;

  status: ClaimStatus;
}

export interface ClaimNotificationPayload {
  claimId: string;

  companyId: string;

  title: string;

  message: string;

  recipients: string[];

  metadata?: Record<string, unknown>;
}

export interface ClaimSearchResult {
  id: string;

  claimNumber: string;

  orderId: string;

  status: ClaimStatus;

  priority: ClaimPriority;

  confidence: number;

  createdAt: Date;
}

export interface ClaimFilter {
  companyId?: string;

  warehouseId?: string;

  orderId?: string;

  status?: ClaimStatus;

  priority?: ClaimPriority;

  assignedTo?: string;

  fromDate?: Date;

  toDate?: Date;
}
