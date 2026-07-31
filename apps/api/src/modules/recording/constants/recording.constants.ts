import { RecordingStatus } from '@prisma/client';

export const RECORDING_DEFAULT_PAGE = 1;
export const RECORDING_DEFAULT_LIMIT = 20;
export const RECORDING_MAX_LIMIT = 100;

export const RECORDING_ALLOWED_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'startedAt',
  'stoppedAt',
] as const;

export const RECORDING_ALLOWED_FILE_EXTENSIONS = [
  '.mp4',
  '.mov',
  '.avi',
  '.mkv',
  '.webm',
] as const;

export const RECORDING_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB

export const RECORDING_ACTIVE_STATUSES: RecordingStatus[] = [
  RecordingStatus.CREATED,
  RecordingStatus.STARTED,
  RecordingStatus.PAUSED,
  RecordingStatus.RESUMED,
  RecordingStatus.UPLOADING,
  RecordingStatus.PROCESSING,
];

export const RECORDING_FINAL_STATUSES: RecordingStatus[] = [
  RecordingStatus.COMPLETED,
  RecordingStatus.FAILED,
];

export const RECORDING_STOPPED_STATUSES: RecordingStatus[] = [
  RecordingStatus.STOPPED,
  RecordingStatus.UPLOADED,
];
