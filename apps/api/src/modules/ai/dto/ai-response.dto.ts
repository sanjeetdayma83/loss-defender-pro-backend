import { AIJobStatus } from '@prisma/client';

import { AIProvider } from '@prisma/client';

export class AiResponseDto {
  id: string;

  orderId: string | null;

  uploadId: string | null;

  recordingId: string | null;

  evidenceId: string | null;

  provider: AIProvider | null;

  model: string | null;

  status: AIJobStatus;

  prompt: string | null;

  response?: unknown;

  error: string | null;

  createdAt: Date;

  updatedAt: Date;
}
