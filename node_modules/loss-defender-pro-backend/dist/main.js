"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.enableCors();
    app.setGlobalPrefix("api/v1", { exclude: ["health", "ready", "api/docs"] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port);
    console.log(`Loss Defender Pro API running on :${port}/api/v1`);
    console.log(`Swagger docs → http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map