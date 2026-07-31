/**
 * -------------------------------------------------------
 * REPORT TYPES
 * -------------------------------------------------------
 */

export const REPORT_TYPE = {
  DASHBOARD: 'DASHBOARD',
  WAREHOUSE: 'WAREHOUSE',
  SCANNER: 'SCANNER',
  USER: 'USER',
  ORDER: 'ORDER',
  CLAIM: 'CLAIM',
  RETURN: 'RETURN',
  AI: 'AI',
} as const;

/**
 * -------------------------------------------------------
 * EXPORT FORMATS
 * -------------------------------------------------------
 */

export const EXPORT_FORMAT = {
  PDF: 'PDF',
  EXCEL: 'EXCEL',
  CSV: 'CSV',
  JSON: 'JSON',
} as const;

/**
 * -------------------------------------------------------
 * DEFAULTS
 * -------------------------------------------------------
 */

export const REPORT_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};
