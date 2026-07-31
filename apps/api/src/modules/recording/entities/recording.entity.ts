import { RecordingStatus } from '@prisma/client';

export class RecordingEntity {
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  operatorId: string;

  status: RecordingStatus;

  startedAt: Date | null;

  pausedAt: Date | null;

  resumedAt: Date | null;

  stoppedAt: Date | null;

  durationSeconds: number;

  localFileName: string | null;

  originalFileName: string | null;

  fileUrl: string | null;

  thumbnailUrl: string | null;

  fileSize: bigint | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;

  constructor(partial: Partial<RecordingEntity>) {
    Object.assign(this, partial);
  }
}
