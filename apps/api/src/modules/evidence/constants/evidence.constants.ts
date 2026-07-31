export const EVIDENCE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 5 GB

  ALLOWED_VIDEO_EXTENSIONS: ['mp4', 'mov', 'avi', 'mkv', 'webm'],

  ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp'],

  SHA256_ALGORITHM: 'sha256',

  DEFAULT_PAGE: 1,

  DEFAULT_LIMIT: 20,

  MAX_LIMIT: 100,
} as const;
