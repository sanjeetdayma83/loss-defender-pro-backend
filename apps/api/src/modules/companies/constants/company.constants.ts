/**
 * -------------------------------------------------------
 * COMPANY STATUS
 * -------------------------------------------------------
 */

export const COMPANY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
} as const;

/**
 * -------------------------------------------------------
 * SUBSCRIPTION PLANS
 * -------------------------------------------------------
 */

export const SUBSCRIPTION_PLAN = {
  TRIAL: 'TRIAL',
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;

/**
 * -------------------------------------------------------
 * COMPANY TYPES
 * -------------------------------------------------------
 */

export const COMPANY_TYPE = {
  INDIVIDUAL: 'INDIVIDUAL',
  PRIVATE_LIMITED: 'PRIVATE_LIMITED',
  PUBLIC_LIMITED: 'PUBLIC_LIMITED',
  LLP: 'LLP',
  PARTNERSHIP: 'PARTNERSHIP',
  PROPRIETORSHIP: 'PROPRIETORSHIP',
} as const;

/**
 * -------------------------------------------------------
 * STORAGE LIMITS (GB)
 * -------------------------------------------------------
 */

export const STORAGE_LIMIT = {
  TRIAL: 5,
  STARTER: 50,
  PROFESSIONAL: 500,
  ENTERPRISE: 5000,
} as const;

/**
 * -------------------------------------------------------
 * USER LIMITS
 * -------------------------------------------------------
 */

export const USER_LIMIT = {
  TRIAL: 2,
  STARTER: 10,
  PROFESSIONAL: 100,
  ENTERPRISE: -1,
} as const;

/**
 * -------------------------------------------------------
 * WAREHOUSE LIMITS
 * -------------------------------------------------------
 */

export const WAREHOUSE_LIMIT = {
  TRIAL: 1,
  STARTER: 3,
  PROFESSIONAL: 25,
  ENTERPRISE: -1,
} as const;

/**
 * -------------------------------------------------------
 * API LIMITS (PER DAY)
 * -------------------------------------------------------
 */

export const API_LIMIT = {
  TRIAL: 1000,
  STARTER: 10000,
  PROFESSIONAL: 100000,
  ENTERPRISE: -1,
} as const;

/**
 * -------------------------------------------------------
 * DEFAULT SETTINGS
 * -------------------------------------------------------
 */

export const DEFAULT_COMPANY_SETTINGS = {
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  language: 'en',
  autoAssignOrders: true,
  recordingEnabled: true,
  aiVerificationEnabled: true,
  notificationsEnabled: true,
  barcodeValidation: true,
} as const;

/**
 * -------------------------------------------------------
 * DEFAULT PAGINATION
 * -------------------------------------------------------
 */

export const COMPANY_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * -------------------------------------------------------
 * AUDIT EVENTS
 * -------------------------------------------------------
 */

export const COMPANY_AUDIT_EVENTS = {
  CREATED: 'COMPANY_CREATED',
  UPDATED: 'COMPANY_UPDATED',
  DELETED: 'COMPANY_DELETED',
  RESTORED: 'COMPANY_RESTORED',
  SUBSCRIPTION_CHANGED: 'SUBSCRIPTION_CHANGED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
} as const;