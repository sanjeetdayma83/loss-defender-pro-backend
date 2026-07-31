import { Injectable } from '@nestjs/common';

import { Notification, NotificationStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationQueryDto } from '../dto/notification-query.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: data as Prisma.NotificationCreateInput,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: data as Prisma.NotificationUpdateInput,
    });
  }

  async softDelete(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async schedule(id: string, scheduledAt: Date): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        scheduledAt,
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });
  }

  async markAsUnread(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        readAt: null,
        status: NotificationStatus.DELIVERED,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
        isDeleted: false,
      },
      data: {
        readAt: new Date(),
        status: NotificationStatus.READ,
      },
    });

    return result.count;
  }

  async incrementRetry(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        retryCount: {
          increment: 1,
        },
      },
    });
  }

  async cancel(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        status: NotificationStatus.CANCELLED,
      },
    });
  }

  async findAll(query: NotificationQueryDto): Promise<Notification[]> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      fromDate,
      toDate,
      ...filters
    } = query;

    const where: Prisma.NotificationWhereInput = {
      isDeleted: false,
      ...filters,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          body: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          recipient: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (fromDate || toDate) {
      where.createdAt = {};

      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }

      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    return this.prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async count(where: Prisma.NotificationWhereInput = {}): Promise<number> {
    return this.prisma.notification.count({
      where,
    });
  }

  async statistics() {
    const [
      total,
      pending,
      processing,
      sent,
      delivered,
      failed,
      cancelled,
      read,
    ] = await Promise.all([
      this.prisma.notification.count({
        where: {
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.PENDING,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.PROCESSING,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.SENT,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.DELIVERED,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.FAILED,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.CANCELLED,
          isDeleted: false,
        },
      }),
      this.prisma.notification.count({
        where: {
          status: NotificationStatus.READ,
          isDeleted: false,
        },
      }),
    ]);

    return {
      total,
      pending,
      processing,
      sent,
      delivered,
      failed,
      cancelled,
      read,
      unread: delivered + sent + processing,
    };
  }

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
