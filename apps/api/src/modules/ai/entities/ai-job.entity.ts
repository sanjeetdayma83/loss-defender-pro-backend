import { AIJob, AIJobStatus, AIProvider, Prisma } from '@prisma/client';

/**
 * Entity matching the generated Prisma AIJob model.
 */
export class AIJobEntity implements AIJob {
  id: string;

  companyId: string;
  warehouseId: string;

  orderId: string | null;
  recordingId: string | null;
  evidenceId: string | null;
  uploadId: string | null;

  provider: AIProvider;
  model: string;
  prompt: string;
  jobType: string;

  input: Prisma.JsonValue;
  output: Prisma.JsonValue;
  metadata: Prisma.JsonValue | null;

  status: AIJobStatus;
  error: string | null;

  // Prisma requires this field to be non-null
  confidence: number;

  processingTime: number | null;
  tokensUsed: number | null;

  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  deletedAt: Date | null;
  isDeleted: boolean;
}
