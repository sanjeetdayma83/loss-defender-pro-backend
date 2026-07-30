import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '@prisma/client';

import {
  Type,
} from 'class-transformer';

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class NotificationQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  recipient?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsEnum([
    'title',
    'channel',
    'priority',
    'status',
    'recipient',
    'scheduledAt',
    'sentAt',
    'deliveredAt',
    'readAt',
    'createdAt',
    'updatedAt',
  ])
  sortBy:
    | 'title'
    | 'channel'
    | 'priority'
    | 'status'
    | 'recipient'
    | 'scheduledAt'
    | 'sentAt'
    | 'deliveredAt'
    | 'readAt'
    | 'createdAt'
    | 'updatedAt' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}