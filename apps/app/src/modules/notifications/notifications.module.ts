import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationDispatcher } from './utils/notification-dispatcher';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationRepository,
    NotificationService,
    NotificationDispatcher,
  ],
  exports: [
    NotificationRepository,
    NotificationService,
    NotificationDispatcher,
  ],
})
export class NotificationsModule {}
