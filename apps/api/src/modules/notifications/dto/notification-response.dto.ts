import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '@prisma/client';

export class NotificationResponseDto {
  id: string;

  userId: string | null;

  companyId: string | null;

  title: string;

  body: string;

  channel: NotificationChannel;

  priority: NotificationPriority;

  status: NotificationStatus;

  template: string | null;

  recipient: string;

  subject: string | null;

  provider: string | null;

  providerMessageId: string | null;

  data: Record<
    string,
    unknown
  > | null;

  metadata: Record<
    string,
    unknown
  > | null;

  retryCount: number;

  scheduledAt: Date | null;

  sentAt: Date | null;

  deliveredAt: Date | null;

  readAt: Date | null;

  failedAt: Date | null;

  failureReason: string | null;

  expiresAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}