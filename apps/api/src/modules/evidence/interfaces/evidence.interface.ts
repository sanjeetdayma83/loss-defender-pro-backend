import { EvidenceStatus } from '@prisma/client';

export interface IEvidence {
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  recordingId: string;

  status: EvidenceStatus;

  originalVideoUrl: string | null;

  processedVideoUrl: string | null;

  thumbnailUrl: string | null;

  hash: string | null;

  checksum: string | null;

  fileSize: number | null;

  duration: number | null;

  metadata: Record<string, unknown> | null;

  generatedAt: Date | null;

  verifiedAt: Date | null;

  archivedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}