import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';

import { NotificationsController } from './controllers/notifications.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationService } from './services/notification.service';
import { NotificationDispatcher } from './utils/notification-dispatcher';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    PrismaService,
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

