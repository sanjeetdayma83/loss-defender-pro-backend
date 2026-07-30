import { Notification } from '@prisma/client';

import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import {
  BulkNotificationRequest,
  NotificationDeliveryResult,
  NotificationStatistics,
  UserNotificationPreferences,
} from '../types/notification.types';

export interface INotificationService {
  create(
    dto: CreateNotificationDto,
  ): Promise<Notification>;

  update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<Notification>;

  remove(
    id: string,
  ): Promise<Notification>;

  findById(
    id: string,
  ): Promise<Notification>;

  findAll(
    query: NotificationQueryDto,
  ): Promise<unknown>;

  send(
    id: string,
  ): Promise<NotificationDeliveryResult>;

  sendBulk(
    request: BulkNotificationRequest,
  ): Promise<NotificationDeliveryResult[]>;

  schedule(
    id: string,
    scheduledAt: Date,
  ): Promise<Notification>;

  retry(
    id: string,
  ): Promise<NotificationDeliveryResult>;

  cancel(
    id: string,
  ): Promise<Notification>;

  markAsRead(
    id: string,
  ): Promise<Notification>;

  markAsUnread(
    id: string,
  ): Promise<Notification>;

  markAllAsRead(
    userId: string,
  ): Promise<number>;

  getUserPreferences(
    userId: string,
  ): Promise<UserNotificationPreferences>;

  updateUserPreferences(
    userId: string,
    preferences: UserNotificationPreferences,
  ): Promise<UserNotificationPreferences>;

  getStatistics(): Promise<NotificationStatistics>;
}