/**
 * -------------------------------------------------------
 * WAREHOUSE STATUS
 * -------------------------------------------------------
 */

export const WAREHOUSE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  CLOSED: 'CLOSED',
} as const;

/**
 * -------------------------------------------------------
 * WAREHOUSE TYPES
 * -------------------------------------------------------
 */

export const WAREHOUSE_TYPE = {
  CENTRAL: 'CENTRAL',
  REGIONAL: 'REGIONAL',
  DISTRIBUTION: 'DISTRIBUTION',
  FULFILLMENT: 'FULFILLMENT',
  DARK_STORE: 'DARK_STORE',
} as const;

/**
 * -------------------------------------------------------
 * ZONE TYPES
 * -------------------------------------------------------
 */

export const ZONE_TYPE = {
  RECEIVING: 'RECEIVING',
  STORAGE: 'STORAGE',
  PICKING: 'PICKING',
  PACKING: 'PACKING',
  QC: 'QUALITY_CONTROL',
  DISPATCH: 'DISPATCH',
  RETURNS: 'RETURNS',
} as const;

/**
 * -------------------------------------------------------
 * CAPACITY
 * -------------------------------------------------------
 */

export const DEFAULT_CAPACITY = {
  MAX_ZONES: 100,
  MAX_RACKS: 1000,
  MAX_BINS: 100000,
  MAX_STAFF: 1000,
};

/**
 * -------------------------------------------------------
 * PAGINATION
 * -------------------------------------------------------
 */

export const WAREHOUSE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/**
 * -------------------------------------------------------
 * AUDIT EVENTS
 * -------------------------------------------------------
 */

export const WAREHOUSE_AUDIT_EVENTS = {
  CREATED: 'WAREHOUSE_CREATED',
  UPDATED: 'WAREHOUSE_UPDATED',
  ACTIVATED: 'WAREHOUSE_ACTIVATED',
  DEACTIVATED: 'WAREHOUSE_DEACTIVATED',
  DELETED: 'WAREHOUSE_DELETED',
};
