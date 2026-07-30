export const UPLOAD_MODULE = 'UPLOAD_MODULE';

export const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 GB

export const DEFAULT_CHUNK_SIZE =
  5 * 1024 * 1024; // 5 MB

export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 20;

export const MAX_LIMIT = 100;

export const DEFAULT_STORAGE_PROVIDER =
  'local';

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
];

export const PRESIGNED_URL_EXPIRY =
  60 * 60; // 1 hour

export const MULTIPART_MIN_PART_SIZE =
  5 * 1024 * 1024; // 5 MB

export const MULTIPART_MAX_PARTS =
  10000;

export const RETRY_ATTEMPTS = 3;

export const RETRY_DELAY = 1000;

export const HASH_ALGORITHM = 'sha256';

export const CHECKSUM_ALGORITHM =
  'sha256';