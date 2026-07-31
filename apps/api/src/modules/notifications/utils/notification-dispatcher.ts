import { Injectable, Logger } from '@nestjs/common';

import { Notification, NotificationStatus } from '@prisma/client';

import { NotificationDeliveryResult } from '../types/notification.types';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  async dispatch(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    switch (notification.channel) {
      case 'EMAIL':
        return this.sendEmail(notification);

      case 'PUSH':
        return this.sendPush(notification);

      case 'IN_APP':
        return this.sendInApp(notification);

      case 'SMS':
        return this.sendSms(notification);

      case 'WHATSAPP':
        return this.sendWhatsApp(notification);

      default:
        this.logger.warn(
          `Unsupported notification channel: ${notification.channel}`,
        );

        return {
          success: false,
          channel: notification.channel,
          provider: 'UNKNOWN',
          error: 'Unsupported notification channel.',
        };
    }
  }

  private sendEmail(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(`Sending email notification ${notification.id}`);

    // Future:
    // Nodemailer
    // SendGrid
    // AWS SES
    // Mailgun
    // Resend

    return Promise.resolve({
      success: true,
      channel: notification.channel,
      provider: 'EMAIL',
      messageId: crypto.randomUUID(),
      deliveredAt: new Date(),
    });
  }

  private sendPush(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(`Sending push notification ${notification.id}`);

    // Future:
    // Firebase Cloud Messaging

    return Promise.resolve({
      success: true,
      channel: notification.channel,
      provider: 'FCM',
      messageId: crypto.randomUUID(),
      deliveredAt: new Date(),
    });
  }

  private sendInApp(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(`Creating in-app notification ${notification.id}`);

    return Promise.resolve({
      success: true,
      channel: notification.channel,
      provider: 'IN_APP',
      messageId: crypto.randomUUID(),
      deliveredAt: new Date(),
    });
  }

  private sendSms(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(`Sending SMS notification ${notification.id}`);

    // Future:
    // Twilio
    // MSG91
    // AWS SNS

    return Promise.resolve({
      success: true,
      channel: notification.channel,
      provider: 'SMS',
      messageId: crypto.randomUUID(),
      deliveredAt: new Date(),
    });
  }

  private sendWhatsApp(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    this.logger.log(`Sending WhatsApp notification ${notification.id}`);

    // Future:
    // Meta WhatsApp Business API
    // Twilio WhatsApp
    // Gupshup

    return Promise.resolve({
      success: true,
      channel: notification.channel,
      provider: 'WHATSAPP',
      messageId: crypto.randomUUID(),
      deliveredAt: new Date(),
    });
  }

  prepareRetry(notification: Notification): Promise<void> {
    this.logger.warn(`Preparing retry for notification ${notification.id}`);
    return Promise.resolve();
  }

  updateDeliveryStatus(
    notification: Notification,
    status: NotificationStatus,
  ): Promise<void> {
    this.logger.log(
      `Notification ${notification.id} status updated to ${status}`,
    );
    return Promise.resolve();
  }
}
