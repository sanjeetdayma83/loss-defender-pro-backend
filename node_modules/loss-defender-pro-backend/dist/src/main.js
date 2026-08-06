"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const common_1 = require("@nestjs/common");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const app_module_1 = require("./app.module");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const swagger_1 = require("@nestjs/swagger");
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Loss Defender Pro API')
        .setDescription('Warehouse intelligence — /api/v1')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'X-Tenant-Id',
            'X-Request-Id',
        ],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`Loss Defender Pro API running on :${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map