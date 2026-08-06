import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({ contentSecurityPolicy: false })); // swagger UI needs this off in dev
  app.enableCors();
  app.setGlobalPrefix("api/v1", { exclude: ["health", "ready", "api/docs"] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Loss Defender Pro API")
    .setDescription("Enterprise Warehouse Intelligence — v3 architecture")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("companies")
    .addTag("warehouses")
    .addTag("users")
    .addTag("orders")
    .addTag("storage")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`Loss Defender Pro API running on :${port}/api/v1`);
  console.log(`Swagger docs → http://localhost:${port}/api/docs`);
}
bootstrap();