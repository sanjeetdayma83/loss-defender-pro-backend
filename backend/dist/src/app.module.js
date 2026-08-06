"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const configuration_1 = require("./config/configuration");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const audit_module_1 = require("./audit/audit.module");
const companies_module_1 = require("./companies/companies.module");
const warehouses_module_1 = require("./warehouses/warehouses.module");
const users_module_1 = require("./users/users.module");
const orders_module_1 = require("./orders/orders.module");
const storage_module_1 = require("./storage/storage.module");
const health_module_1 = require("./health/health.module");
const recordings_module_1 = require("./recordings/recordings.module");
const evidence_module_1 = require("./evidence/evidence.module");
const claims_module_1 = require("./claims/claims.module");
const returns_module_1 = require("./returns/returns.module");
const scanner_module_1 = require("./scanner/scanner.module");
const alerts_module_1 = require("./alerts/alerts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [configuration_1.default] }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            warehouses_module_1.WarehousesModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            storage_module_1.StorageModule,
            health_module_1.HealthModule,
            scanner_module_1.ScannerModule,
            recordings_module_1.RecordingsModule,
            evidence_module_1.EvidenceModule,
            claims_module_1.ClaimsModule,
            returns_module_1.ReturnsModule,
            alerts_module_1.AlertsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map