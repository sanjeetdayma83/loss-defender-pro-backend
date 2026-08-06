"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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