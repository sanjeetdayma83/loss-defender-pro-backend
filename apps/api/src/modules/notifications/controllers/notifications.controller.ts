import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { NotificationService } from '../services/notification.service';
import type {
  BulkNotificationRequest,
  UserNotificationPreferences,
} from '../types/notification.types';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.WAREHOUSE_MANAGER,
  UserRole.SUPERVISOR,
  UserRole.OPERATOR,
  UserRole.VIEWER,
)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  findAll(@Query() query: NotificationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.notificationService.getStatistics();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.notificationService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
    return this.notificationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.notificationService.send(id);
  }

  @Post('bulk')
  sendBulk(
    @Body()
    request: BulkNotificationRequest,
  ) {
    return this.notificationService.sendBulk(request);
  }

  @Post(':id/schedule')
  schedule(
    @Param('id') id: string,
    @Body('scheduledAt')
    scheduledAt: Date,
  ) {
    return this.notificationService.schedule(id, new Date(scheduledAt));
  }

  @Post(':id/retry')
  retry(@Param('id') id: string) {
    return this.notificationService.retry(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.notificationService.cancel(id);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Post(':id/unread')
  markAsUnread(@Param('id') id: string) {
    return this.notificationService.markAsUnread(id);
  }

  @Post('users/:userId/read-all')
  markAllAsRead(
    @Param('userId')
    userId: string,
  ) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('users/:userId/preferences')
  getPreferences(
    @Param('userId')
    userId: string,
  ) {
    return this.notificationService.getUserPreferences(userId);
  }

  @Patch('users/:userId/preferences')
  updatePreferences(
    @Param('userId')
    userId: string,
    @Body()
    preferences: UserNotificationPreferences,
  ) {
    return this.notificationService.updateUserPreferences(userId, preferences);
  }
}

