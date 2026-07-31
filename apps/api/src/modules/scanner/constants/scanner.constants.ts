/**
 * -------------------------------------------------------
 * SCAN STATUS
 * -------------------------------------------------------
 */

export const SCAN_STATUS = {
  PENDING: 'PENDING',
  SCANNED: 'SCANNED',
  VERIFIED: 'VERIFIED',
  DUPLICATE: 'DUPLICATE',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
} as const;

/**
 * -------------------------------------------------------
 * SESSION STATUS
 * -------------------------------------------------------
 */

export const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/**
 * -------------------------------------------------------
 * BARCODE TYPES
 * -------------------------------------------------------
 */

export const BARCODE_TYPES = {
  QR: 'QR',
  CODE128: 'CODE128',
  CODE39: 'CODE39',
  EAN13: 'EAN13',
  EAN8: 'EAN8',
  UPC: 'UPC',
} as const;

/**
 * -------------------------------------------------------
 * DEFAULTS
 * -------------------------------------------------------
 */

export const SCANNER_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};
