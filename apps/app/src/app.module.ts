import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import storageConfig from './config/storage.config';
import { LoggerModule } from './common/logger/logger.module';

import { envSchema } from './config/env.schema';
import { OrdersModule } from './modules/orders/orders.module';

import { RecordingModule } from './modules/recording/recording.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CompanyModule } from './modules/company/company.module';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { UsersModule } from './modules/users/users.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,

      load: [appConfig, authConfig, databaseConfig, storageConfig],

      validate: (config) => envSchema.parse(config),
    }),

    LoggerModule,

    PrismaModule,

    AuthModule,

    HealthModule,

    CompanyModule,

    WarehousesModule,

    RecordingModule,

    OrdersModule,

    UsersModule,

    ScannerModule,

    EvidenceModule,

    ClaimsModule,

    ReturnsModule,

    NotificationsModule,

    ReportsModule,

    AiModule,

    UploadModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
