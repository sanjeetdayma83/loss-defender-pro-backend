import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../../database/prisma.module';
import { UploadModule } from '../upload/upload.module';

import { HealthController } from './controllers/health/health.controller';
import { HealthService } from './services/health/health.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UploadModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
