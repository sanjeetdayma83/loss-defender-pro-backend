import {
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NestFactory,
  Reflector,
} from '@nestjs/core';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { setupSwagger } from './config/swagger.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);

  app.use(helmet());

    // CORS: explicit allow-list from ALLOWED_ORIGINS (comma-separated).
  // Never reflect arbitrary Origin when credentials are enabled.
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ??
    'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  app.setGlobalPrefix(config.get<string>('app.apiPrefix') ?? 'api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector)),
  new ResponseInterceptor(),
);

  app.useGlobalFilters(new GlobalExceptionFilter());

  if ((process.env.NODE_ENV ?? 'development') !== 'production') {
    setupSwagger(app, config);
  }

  app.enableShutdownHooks();

  const port = config.get<number>('app.port') ?? 3000;

  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 ${config.get<string>('app.name')} running on http://localhost:${port}`,
  );
}

void bootstrap();


