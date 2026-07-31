import { UploadCategory, UploadStatus, UploadVisibility } from '@prisma/client';

export class UploadResponseDto {
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string | null;

  recordingId: string | null;

  evidenceId: string | null;

  originalName: string;

  fileName: string;

  storageKey: string;

  bucket: string;

  provider: string;

  mimeType: string;

  extension: string;

  category: UploadCategory;

  visibility: UploadVisibility;

  status: UploadStatus;

  size: bigint;

  checksum: string | null;

  hash: string | null;

  etag: string | null;

  metadata: Record<string, unknown> | null;

  uploadedAt: Date | null;

  expiresAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
