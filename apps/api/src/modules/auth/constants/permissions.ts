export const PERMISSIONS = {
  // ======================================================
  // Company
  // ======================================================
  COMPANY_VIEW: 'company:view',
  COMPANY_CREATE: 'company:create',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',

  // ======================================================
  // Users
  // ======================================================
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // ======================================================
  // Warehouses
  // ======================================================
  WAREHOUSE_VIEW: 'warehouse:view',
  WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_UPDATE: 'warehouse:update',
  WAREHOUSE_DELETE: 'warehouse:delete',

  // ======================================================
  // Orders
  // ======================================================
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',

  // ======================================================
  // Recording
  // ======================================================
  RECORDING_VIEW: 'recording:view',
  RECORDING_CREATE: 'recording:create',
  RECORDING_UPDATE: 'recording:update',
  RECORDING_DELETE: 'recording:delete',

  // ======================================================
  // Evidence
  // ======================================================
  EVIDENCE_VIEW: 'evidence:view',
  EVIDENCE_CREATE: 'evidence:create',
  EVIDENCE_UPDATE: 'evidence:update',
  EVIDENCE_DELETE: 'evidence:delete',

  // ======================================================
  // Claims
  // ======================================================
  CLAIM_VIEW: 'claim:view',
  CLAIM_CREATE: 'claim:create',
  CLAIM_UPDATE: 'claim:update',
  CLAIM_DELETE: 'claim:delete',

  // ======================================================
  // AI
  // ======================================================
  AI_VIEW: 'ai:view',
  AI_USE: 'ai:use',
  AI_MANAGE: 'ai:manage',

  // ======================================================
  // Dashboard
  // ======================================================
  DASHBOARD_VIEW: 'dashboard:view',

  // ======================================================
  // Reports
  // ======================================================
  REPORT_VIEW: 'report:view',
  REPORT_EXPORT: 'report:export',

  // ======================================================
  // Settings
  // ======================================================
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
