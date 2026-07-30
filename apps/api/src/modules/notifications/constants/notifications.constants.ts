/**
 * Pagination
 */
export const NOTIFICATION_DEFAULT_PAGE = 1;

export const NOTIFICATION_DEFAULT_LIMIT = 20;

export const NOTIFICATION_MAX_LIMIT = 100;

/**
 * Retry Policy
 */
export const NOTIFICATION_MAX_RETRIES = 5;

export const NOTIFICATION_RETRY_DELAY_MS = 5_000;

export const NOTIFICATION_RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * Queue Names
 */
export const NOTIFICATION_QUEUE = 'notification-queue';

export const EMAIL_NOTIFICATION_QUEUE = 'email-notification-queue';

export const PUSH_NOTIFICATION_QUEUE = 'push-notification-queue';

export const SMS_NOTIFICATION_QUEUE = 'sms-notification-queue';

export const WHATSAPP_NOTIFICATION_QUEUE =
  'whatsapp-notification-queue';

/**
 * Delivery Channels
 */
export const NOTIFICATION_CHANNEL_EMAIL = 'EMAIL';

export const NOTIFICATION_CHANNEL_PUSH = 'PUSH';

export const NOTIFICATION_CHANNEL_IN_APP = 'IN_APP';

export const NOTIFICATION_CHANNEL_SMS = 'SMS';

export const NOTIFICATION_CHANNEL_WHATSAPP = 'WHATSAPP';

/**
 * Priorities
 */
export const NOTIFICATION_PRIORITY_LOW = 'LOW';

export const NOTIFICATION_PRIORITY_MEDIUM = 'MEDIUM';

export const NOTIFICATION_PRIORITY_HIGH = 'HIGH';

export const NOTIFICATION_PRIORITY_CRITICAL =
  'CRITICAL';

/**
 * Delivery Status
 */
export const NOTIFICATION_STATUS_PENDING =
  'PENDING';

export const NOTIFICATION_STATUS_PROCESSING =
  'PROCESSING';

export const NOTIFICATION_STATUS_SENT = 'SENT';

export const NOTIFICATION_STATUS_DELIVERED =
  'DELIVERED';

export const NOTIFICATION_STATUS_FAILED =
  'FAILED';

export const NOTIFICATION_STATUS_CANCELLED =
  'CANCELLED';

export const NOTIFICATION_STATUS_READ = 'READ';

/**
 * Batch Configuration
 */
export const NOTIFICATION_BATCH_SIZE = 100;

export const NOTIFICATION_BULK_LIMIT = 1000;

/**
 * Rate Limiting
 */
export const EMAIL_RATE_LIMIT_PER_MINUTE = 100;

export const PUSH_RATE_LIMIT_PER_MINUTE = 500;

export const SMS_RATE_LIMIT_PER_MINUTE = 50;

export const WHATSAPP_RATE_LIMIT_PER_MINUTE = 80;

/**
 * Template Names
 */
export const TEMPLATE_WELCOME = 'WELCOME';

export const TEMPLATE_PASSWORD_RESET =
  'PASSWORD_RESET';

export const TEMPLATE_VERIFY_EMAIL =
  'VERIFY_EMAIL';

export const TEMPLATE_ORDER_CREATED =
  'ORDER_CREATED';

export const TEMPLATE_ORDER_COMPLETED =
  'ORDER_COMPLETED';

export const TEMPLATE_ORDER_CANCELLED =
  'ORDER_CANCELLED';

export const TEMPLATE_RETURN_CREATED =
  'RETURN_CREATED';

export const TEMPLATE_RETURN_APPROVED =
  'RETURN_APPROVED';

export const TEMPLATE_RETURN_REJECTED =
  'RETURN_REJECTED';

export const TEMPLATE_RETURN_REFUNDED =
  'RETURN_REFUNDED';

export const TEMPLATE_RETURN_REPLACED =
  'RETURN_REPLACED';

export const TEMPLATE_CLAIM_CREATED =
  'CLAIM_CREATED';

export const TEMPLATE_CLAIM_APPROVED =
  'CLAIM_APPROVED';

export const TEMPLATE_CLAIM_REJECTED =
  'CLAIM_REJECTED';

export const TEMPLATE_AI_ANALYSIS_COMPLETED =
  'AI_ANALYSIS_COMPLETED';

/**
 * Scheduled Notifications
 */
export const NOTIFICATION_SCHEDULER_INTERVAL_MS =
  60_000;

/**
 * Notification Expiry
 */
export const NOTIFICATION_EXPIRY_DAYS = 30;

/**
 * Default Sender
 */
export const DEFAULT_EMAIL_FROM =
  'support@lossdefenderpro.in';

export const DEFAULT_SMS_SENDER =
  'LossDefender';

export const DEFAULT_PUSH_ICON =
  'notification';

/**
 * Firebase Topics
 */
export const FIREBASE_TOPIC_ALL_USERS =
  'all-users';

export const FIREBASE_TOPIC_ADMINS =
  'admins';

export const FIREBASE_TOPIC_WAREHOUSE =
  'warehouse';

export const FIREBASE_TOPIC_OPERATIONS =
  'operations';