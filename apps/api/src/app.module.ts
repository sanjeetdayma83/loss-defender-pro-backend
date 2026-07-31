import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import storageConfig from './config/storage.config';
import { LoggerModule } from './common/logger/logger.module';

import { envSchema } from './config/env.schema';
import { OrderModule } from './modules/order/order.module';

import { RecordingModule } from './modules/recording/recording.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { CompanyModule } from './modules/company/company.module';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { UserModule } from './modules/user/user.module';

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

    WarehouseModule,

    RecordingModule,

    OrderModule,

    UserModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
