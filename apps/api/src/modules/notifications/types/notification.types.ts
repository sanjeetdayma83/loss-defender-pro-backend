export interface NotificationRecipient {
  userId?: string;

  email?: string;

  phone?: string;

  deviceToken?: string;

  topic?: string;
}

export interface NotificationPayload {
  title: string;

  body: string;

  data?: Record<string, unknown>;

  imageUrl?: string;

  actionUrl?: string;
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | null;
}

export interface NotificationDeliveryResult {
  success: boolean;

  channel: string;

  provider: string;

  messageId?: string;

  error?: string;

  deliveredAt?: Date;
}

export interface NotificationRetryMetadata {
  retryCount: number;

  maxRetries: number;

  nextRetryAt?: Date;

  lastError?: string;
}

export interface NotificationQueuePayload {
  notificationId: string;

  channel: string;

  recipient: NotificationRecipient;

  payload: NotificationPayload;

  priority: string;

  scheduledAt?: Date;
}

export interface BulkNotificationRequest {
  recipients: NotificationRecipient[];

  payload: NotificationPayload;

  channels: string[];

  priority: string;

  template?: string;

  variables?: TemplateVariables;
}

export interface NotificationStatistics {
  total: number;

  pending: number;

  processing: number;

  sent: number;

  delivered: number;

  failed: number;

  cancelled: number;

  read: number;

  unread: number;
}

export interface ChannelDeliveryStatus {
  channel: string;

  status: string;

  deliveredAt?: Date;

  messageId?: string;

  provider?: string;

  error?: string;
}

export interface UserNotificationPreferences {
  userId: string;

  emailEnabled: boolean;

  pushEnabled: boolean;

  smsEnabled: boolean;

  whatsappEnabled: boolean;

  inAppEnabled: boolean;

  quietHoursEnabled: boolean;

  quietHoursStart?: string;

  quietHoursEnd?: string;
}

export interface NotificationSearchResult<T> {
  items: T[];

  total: number;

  page: number;

  limit: number;

  hasNext: boolean;

  hasPrevious: boolean;
}