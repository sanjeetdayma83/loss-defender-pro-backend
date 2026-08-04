import { TenantInterceptor } from './core/interceptors/tenant.interceptor';
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

    // ==========================================================
// CORS
// ==========================================================

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:51352',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:51352',

    'https://lossdefender.in',
    'https://www.lossdefender.in',

    'https://app.lossdefender.in',
    'https://admin.lossdefender.in',
    'https://api.lossdefender.in'
  ].join(',')
)
.split(',')
.map(o => o.trim())
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

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    console.log('❌ CORS Blocked:', origin);

    callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Origin',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Requested-With',
  ],
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

  app.useGlobalInterceptors(new TenantInterceptor());
  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 ${config.get<string>('app.name')} running on http://localhost:${port}`,
  );
}

void bootstrap();




