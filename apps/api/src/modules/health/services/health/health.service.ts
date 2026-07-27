import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth() {
    return {
      status: 'healthy',

      service:
        this.configService.get<string>('app.name') ?? 'Loss Defender Pro API',

      version: '1.0.0',

      environment: this.configService.get<string>('app.env') ?? 'development',

      timestamp: new Date().toISOString(),

      uptime: Math.floor(process.uptime()),
    };
  }

  getLive() {
    return {
      status: 'alive',
    };
  }

  getReady() {
    return {
      status: 'ready',
    };
  }
}
