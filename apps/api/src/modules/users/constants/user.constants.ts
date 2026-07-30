/**
 * -------------------------------------------------------
 * USER STATUS
 * -------------------------------------------------------
 */

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
} as const;

/**
 * -------------------------------------------------------
 * USER ROLES
 * -------------------------------------------------------
 */

export const USER_ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  SUPERVISOR: 'SUPERVISOR',
  QC: 'QC',
  PACKER: 'PACKER',
  SCANNER_OPERATOR: 'SCANNER_OPERATOR',
  VIEWER: 'VIEWER',
} as const;

/**
 * -------------------------------------------------------
 * DEFAULTS
 * -------------------------------------------------------
 */

export const USER_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
};