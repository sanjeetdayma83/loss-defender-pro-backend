import {
  AIJob,
  AIJobStatus,
  AIProvider,
} from '@prisma/client';

export class AIJobEntity
  implements AIJob
{
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string | null;

  uploadId: string | null;

  recordingId: string | null;

  evidenceId: string | null;

  provider: AIProvider;

  model: string;

  jobType: string;

  status: AIJobStatus;

  prompt: string;

  input: unknown;

  output: unknown | null;

  confidence: number;

  tokensUsed: number | null;

  processingTime: number | null;

  error: string | null;

  startedAt: Date | null;

  completedAt: Date | null;

  metadata: unknown | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}