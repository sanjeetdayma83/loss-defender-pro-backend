import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'support@lossdefender.in',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      const senderEmail = process.env.SMTP_USER || 'support@lossdefender.in';
      const info = await this.transporter.sendMail({
        from: '"Loss Defender Pro" <' + senderEmail + '>',
        to,
        subject,
        text,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('SMTP Email Error:', error);
      return { success: false, error };
    }
  }
}
