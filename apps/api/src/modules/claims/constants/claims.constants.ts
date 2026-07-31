/**
 * ============================================================
 * Claims Module Constants
 * ============================================================
 */

export const CLAIMS_MODULE = 'CLAIMS';

/**
 * Queue
 */
export const CLAIM_QUEUE = 'claim-queue';

/**
 * Timeouts
 */
export const CLAIM_TIMEOUT = 5 * 60 * 1000;

export const CLAIM_RETRY_DELAY = 30 * 1000;

export const MAX_CLAIM_RETRIES = 3;

/**
 * Pagination
 */
export const DEFAULT_PAGE = 1;

export const DEFAULT_LIMIT = 20;

export const MAX_LIMIT = 100;

/**
 * Confidence
 */
export const DEFAULT_CONFIDENCE = 0;

export const MAX_CONFIDENCE = 1;

/**
 * SLA
 */
export const DEFAULT_SLA_HOURS = 24;

export const ESCALATION_AFTER_HOURS = 48;

/**
 * Attachments
 */
export const MAX_ATTACHMENTS = 100;

export const MAX_ATTACHMENT_SIZE = 1024 * 1024 * 100;

/**
 * Evidence
 */
export const MAX_EVIDENCE_ITEMS = 1000;

/**
 * Supported File Types
 */
export const SUPPORTED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'application/pdf',
] as const;

/**
 * AI
 */
export const AUTO_ANALYSIS_THRESHOLD = 0.85;

/**
 * Claim Priorities
 */
export const CLAIM_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

/**
 * Claim Statuses
 */
export const CLAIM_STATUSES = [
  'DRAFT',
  'OPEN',
  'UNDER_REVIEW',
  'AI_ANALYZING',
  'WAITING_FOR_EVIDENCE',
  'APPROVED',
  'REJECTED',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
] as const;

/**
 * Resolution Types
 */
export const CLAIM_RESOLUTIONS = [
  'REFUND',
  'REPLACEMENT',
  'PARTIAL_REFUND',
  'DENIED',
  'NO_ACTION',
] as const;

/**
 * Audit
 */
export const CLAIM_AUDIT_EVENT = 'claim.audit';

export const CLAIM_CREATED_EVENT = 'claim.created';

export const CLAIM_UPDATED_EVENT = 'claim.updated';

export const CLAIM_RESOLVED_EVENT = 'claim.resolved';

export const CLAIM_CLOSED_EVENT = 'claim.closed';
