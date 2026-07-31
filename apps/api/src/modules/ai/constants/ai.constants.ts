export const AI_MODULE = 'AI_MODULE';

export const DEFAULT_AI_PROVIDER = 'gemini';

export const AI_JOB_TIMEOUT = 10 * 60 * 1000; // 10 Minutes

export const AI_JOB_RETRY_COUNT = 3;

export const AI_JOB_RETRY_DELAY = 5000; // 5 Seconds

export const AI_BATCH_SIZE = 10;

export const AI_MAX_CONCURRENT_JOBS = 5;

export const AI_DEFAULT_CONFIDENCE = 0.8;

export const AI_MIN_CONFIDENCE = 0.5;

export const AI_MAX_CONFIDENCE = 1.0;

export const AI_DEFAULT_LANGUAGE = 'en';

export const AI_DEFAULT_MODEL = 'gemini-2.5-pro';

export const AI_DEFAULT_TEMPERATURE = 0.2;

export const AI_DEFAULT_MAX_TOKENS = 4096;

export const AI_QUEUE_NAME = 'ai-processing';

export const AI_VIDEO_ANALYSIS_JOB = 'video-analysis';

export const AI_IMAGE_ANALYSIS_JOB = 'image-analysis';

export const AI_BARCODE_ANALYSIS_JOB = 'barcode-analysis';

export const AI_OCR_JOB = 'ocr-analysis';

export const AI_EVIDENCE_VALIDATION_JOB = 'evidence-validation';

export const AI_REPORT_GENERATION_JOB = 'report-generation';

export const AI_SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
];

export const AI_SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const AI_SUPPORTED_DOCUMENT_TYPES = ['application/pdf'];

export const AI_CHECKSUM_ALGORITHM = 'sha256';

export const AI_HASH_ALGORITHM = 'sha256';
