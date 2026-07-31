import { RecordingStatus } from '@prisma/client';

export interface RecordingFilters {
  companyId?: string;
  warehouseId?: string;
  orderId?: string;
  operatorId?: string;
  status?: RecordingStatus;
  isDeleted?: boolean;
}

export interface RecordingPagination {
  page: number;
  limit: number;
}

export interface RecordingSort {
  field?: 'createdAt' | 'updatedAt' | 'startedAt' | 'stoppedAt';
  order?: 'asc' | 'desc';
}

export interface RecordingQueryOptions {
  filters?: RecordingFilters;
  pagination?: RecordingPagination;
  sort?: RecordingSort;
}

export interface RecordingUploadMetadata {
  localFileName?: string;
  originalFileName?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileSize?: bigint;
}

export interface RecordingDuration {
  startedAt: Date | null;
  pausedAt: Date | null;
  resumedAt: Date | null;
  stoppedAt: Date | null;
  durationSeconds: number;
}
