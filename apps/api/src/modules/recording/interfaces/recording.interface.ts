export interface RecordingInterface {
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  operatorId: string;

  status:
    | 'CREATED'
    | 'STARTED'
    | 'PAUSED'
    | 'RESUMED'
    | 'STOPPED'
    | 'UPLOADING'
    | 'UPLOADED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';

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
}