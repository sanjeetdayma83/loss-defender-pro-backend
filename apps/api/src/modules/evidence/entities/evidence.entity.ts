import { EvidenceStatus } from '@prisma/client';

export class EvidenceEntity {
  id!: string;

  companyId!: string;

  warehouseId!: string;

  orderId!: string;

  recordingId!: string;

  status!: EvidenceStatus;

  originalVideoUrl!: string | null;

  processedVideoUrl!: string | null;

  thumbnailUrl!: string | null;

  hash!: string | null;

  checksum!: string | null;

  fileSize!: number | null;

  duration!: number | null;

  metadata!: Record<string, unknown> | null;

  generatedAt!: Date | null;

  verifiedAt!: Date | null;

  archivedAt!: Date | null;

  createdAt!: Date;

  updatedAt!: Date;

  deletedAt!: Date | null;

  isDeleted!: boolean;

  constructor(
    partial?: Partial<EvidenceEntity>,
  ) {
    Object.assign(this, partial);
  }
}