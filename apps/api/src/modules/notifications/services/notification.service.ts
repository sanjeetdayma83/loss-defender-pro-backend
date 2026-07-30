import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Notification,
  NotificationStatus,
} from '@prisma/client';

import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { INotificationService } from '../interfaces/notification.interface';
import { NotificationRepository } from '../repositories/notification.repository';
import {
  BulkNotificationRequest,
  NotificationDeliveryResult,
  NotificationStatistics,
  UserNotificationPreferences,
} from '../types/notification.types';
import { NotificationDispatcher } from '../utils/notification-dispatcher';

@Injectable()
export class NotificationService
  implements INotificationService
{
  constructor(
    private readonly repository: NotificationRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async create(
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.repository.create(dto);
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.update(
      id,
      dto,
    );
  }

  async remove(
    id: string,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.softDelete(
      id,
    );
  }

  async findById(
    id: string,
  ): Promise<Notification> {
    const notification =
      await this.repository.findById(id);

    if (!notification) {
      throw new NotFoundException(
        'Notification not found.',
      );
    }

    return notification;
  }

  async findAll(
    query: NotificationQueryDto,
  ) {
    const items =
      await this.repository.findAll(
        query,
      );

    const total =
      await this.repository.count();

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async send(
    id: string,
  ): Promise<NotificationDeliveryResult> {
    const notification =
      await this.findById(id);

    return this.dispatcher.dispatch(
      notification,
    );
  }

  async sendBulk(
    request: BulkNotificationRequest,
  ): Promise<
    NotificationDeliveryResult[]
  > {
    const results: NotificationDeliveryResult[] =
      [];

    for (const recipient of request.recipients) {
      const notification =
        await this.repository.create({
          title: request.payload.title,
          body: request.payload.body,
          channel:
            request.channels[0] as any,
          priority:
            request.priority as any,
          recipient:
            recipient.email ??
            recipient.phone ??
            recipient.userId ??
            '',
          template:
            request.template,
          data: request.payload.data,
        } as CreateNotificationDto);

      results.push(
        await this.dispatcher.dispatch(
          notification,
        ),
      );
    }

    return results;
  }

  async schedule(
    id: string,
    scheduledAt: Date,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.schedule(
      id,
      scheduledAt,
    );
  }

  async retry(
    id: string,
  ): Promise<NotificationDeliveryResult> {
    await this.repository.incrementRetry(
      id,
    );

    return this.send(id);
  }

  async cancel(
    id: string,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.cancel(id);
  }

  async markAsRead(
    id: string,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.markAsRead(
      id,
    );
  }

  async markAsUnread(
    id: string,
  ): Promise<Notification> {
    await this.findById(id);

    return this.repository.markAsUnread(
      id,
    );
  }

  async markAllAsRead(
    userId: string,
  ): Promise<number> {
    return this.repository.markAllAsRead(
      userId,
    );
  }

  async getUserPreferences(
    userId: string,
  ): Promise<UserNotificationPreferences> {
    return {
      userId,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      whatsappEnabled: false,
      inAppEnabled: true,
      quietHoursEnabled: false,
    };
  }

  async updateUserPreferences(
    userId: string,
    preferences: UserNotificationPreferences,
  ): Promise<UserNotificationPreferences> {
    return {
      ...preferences,
      userId,
    };
  }

  async getStatistics(): Promise<NotificationStatistics> {
    return this.repository.statistics();
  }
}