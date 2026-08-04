import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  config: ConfigService,
): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get<string>('app.name') ?? 'Loss Defender Pro API')
    .setDescription('Enterprise Warehouse Intelligence Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

