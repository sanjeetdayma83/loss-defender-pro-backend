import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import helmet from 'helmet';
import request from 'supertest';

import { AppModule } from './../src/app.module';

import { ResponseInterceptor } from './../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './../src/common/filters/global-exception.filter';

describe('Health Endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app =
      moduleFixture.createNestApplication();

    const config =
      app.get(ConfigService);

    app.use(helmet());

    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.setGlobalPrefix(
      config.get<string>('app.apiPrefix') ??
        'api',
    );

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
      new ResponseInterceptor(),
    );

    app.useGlobalFilters(
      new GlobalExceptionFilter(),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health', async () => {
    const res = await request(
      app.getHttpServer(),
    )
      .get('/api/health')
      .expect(200);

    expect(res.body.success).toBe(true);

    expect(
      res.body.data.status,
    ).toBe('healthy');
  });
});