/**
 * Pagination
 */
export const ORDER_DEFAULT_PAGE = 1;

export const ORDER_DEFAULT_LIMIT = 20;

export const ORDER_MAX_LIMIT = 100;

/**
 * Order Number
 */
export const ORDER_NUMBER_PREFIX = 'ORD';

/**
 * Marketplace
 */
export const MARKETPLACE_AMAZON = 'AMAZON';

export const MARKETPLACE_FLIPKART = 'FLIPKART';

export const MARKETPLACE_MEESHO = 'MEESHO';

export const MARKETPLACE_SHOPIFY = 'SHOPIFY';

export const MARKETPLACE_WOOCOMMERCE = 'WOOCOMMERCE';

export const MARKETPLACE_MANUAL = 'MANUAL';

/**
 * Priority
 */
export const ORDER_PRIORITY_LOW = 'LOW';

export const ORDER_PRIORITY_MEDIUM = 'MEDIUM';

export const ORDER_PRIORITY_HIGH = 'HIGH';

export const ORDER_PRIORITY_CRITICAL = 'CRITICAL';

/**
 * Order Status
 */
export const ORDER_STATUS_CREATED = 'CREATED';

export const ORDER_STATUS_ASSIGNED = 'ASSIGNED';

export const ORDER_STATUS_PICKING = 'PICKING';

export const ORDER_STATUS_PACKING = 'PACKING';

export const ORDER_STATUS_RECORDING = 'RECORDING';

export const ORDER_STATUS_VERIFYING = 'VERIFYING';

export const ORDER_STATUS_READY_TO_SHIP = 'READY_TO_SHIP';

export const ORDER_STATUS_SHIPPED = 'SHIPPED';

export const ORDER_STATUS_DELIVERED = 'DELIVERED';

export const ORDER_STATUS_CANCELLED = 'CANCELLED';

export const ORDER_STATUS_RETURNED = 'RETURNED';

export const ORDER_STATUS_CLAIMED = 'CLAIMED';

/**
 * Verification Status
 */
export const VERIFICATION_PENDING = 'PENDING';

export const VERIFICATION_IN_PROGRESS = 'IN_PROGRESS';

export const VERIFICATION_PASSED = 'PASSED';

export const VERIFICATION_FAILED = 'FAILED';

/**
 * Packing Status
 */
export const PACKING_PENDING = 'PENDING';

export const PACKING_STARTED = 'STARTED';

export const PACKING_COMPLETED = 'COMPLETED';

export const PACKING_FAILED = 'FAILED';

/**
 * SLA
 */
export const ORDER_ASSIGNMENT_SLA_MINUTES = 15;

export const ORDER_PACKING_SLA_MINUTES = 30;

export const ORDER_VERIFICATION_SLA_MINUTES = 10;

export const ORDER_DISPATCH_SLA_MINUTES = 60;

/**
 * Queue Names
 */
export const ORDER_QUEUE = 'order-queue';

export const ORDER_SYNC_QUEUE = 'order-sync-queue';

export const ORDER_VERIFICATION_QUEUE =
  'order-verification-queue';

export const ORDER_ANALYTICS_QUEUE =
  'order-analytics-queue';

/**
 * Retry Policy
 */
export const ORDER_MAX_RETRIES = 5;

export const ORDER_RETRY_DELAY_MS = 5000;

/**
 * Batch Configuration
 */
export const ORDER_BATCH_SIZE = 100;

/**
 * Audit Events
 */
export const ORDER_CREATED_EVENT = 'ORDER_CREATED';

export const ORDER_UPDATED_EVENT = 'ORDER_UPDATED';

export const ORDER_ASSIGNED_EVENT = 'ORDER_ASSIGNED';

export const ORDER_PACKING_STARTED_EVENT =
  'ORDER_PACKING_STARTED';

export const ORDER_PACKING_COMPLETED_EVENT =
  'ORDER_PACKING_COMPLETED';

export const ORDER_RECORDING_STARTED_EVENT =
  'ORDER_RECORDING_STARTED';

export const ORDER_VERIFIED_EVENT =
  'ORDER_VERIFIED';

export const ORDER_SHIPPED_EVENT =
  'ORDER_SHIPPED';

export const ORDER_DELIVERED_EVENT =
  'ORDER_DELIVERED';

export const ORDER_CANCELLED_EVENT =
  'ORDER_CANCELLED';

export const ORDER_RETURN_CREATED_EVENT =
  'ORDER_RETURN_CREATED';

export const ORDER_CLAIM_CREATED_EVENT =
  'ORDER_CLAIM_CREATED';