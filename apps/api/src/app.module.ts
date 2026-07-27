import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import storageConfig from './config/storage.config';
import swaggerConfig from './config/swagger.config';

import { validateEnv } from './config';

import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      cache: true,

      expandVariables: true,

      validate: validateEnv,

      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],

      load: [
        appConfig,
        authConfig,
        databaseConfig,
        storageConfig,
        swaggerConfig,
      ],
    }),
    HealthModule,
  ],
})
export class AppModule {}
