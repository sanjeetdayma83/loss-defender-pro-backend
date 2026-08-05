import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../../database/prisma.service';
import { StorageService } from '../../../upload/storage/storage.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getHealth() {
    const started = Date.now();

    let database = 'down';
    let storage = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {}

    try {
      await this.storage.generateUploadUrl(
        'healthcheck/ping.txt',
        'text/plain',
        60,
      );
      storage = 'up';
    } catch {}

    const mem = process.memoryUsage();

    return {
      status:
        database === 'up' && storage === 'up'
          ? 'healthy'
          : 'degraded',

      service:
        this.config.get('app.name') ??
        'Loss Defender Pro API',

      version: '1.0.0',

      environment:
        this.config.get('app.env') ??
        'production',

      timestamp: new Date().toISOString(),

      uptime: Math.floor(process.uptime()),

      node: process.version,

      database,

      storage,

      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
      },

      responseTime: `${Date.now() - started} ms`,
    };
  }

  getLive() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  async getReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
      };
    } catch {
      return {
        status: 'not-ready',
      };
    }
  }
}
