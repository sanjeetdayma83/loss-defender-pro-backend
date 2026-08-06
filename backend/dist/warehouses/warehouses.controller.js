"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesController = void 0;
const common_1 = require("@nestjs/common");
const warehouses_service_1 = require("./warehouses.service");
const warehouse_dto_1 = require("./dto/warehouse.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let WarehousesController = class WarehousesController {
    constructor(warehouses) {
        this.warehouses = warehouses;
    }
    list(user) {
        return this.warehouses.list(user.companyId);
    }
    getOne(user, id) {
        return this.warehouses.getOne(user.companyId, id);
    }
    create(user, dto, req) {
        return this.warehouses.create(user.companyId, user.sub, dto, req.ip);
    }
    update(user, id, dto, req) {
        return this.warehouses.update(user.companyId, id, user.sub, dto, req.ip);
    }
    createStation(user, warehouseId, dto, req) {
        return this.warehouses.createStation(user.companyId, warehouseId, user.sub, dto, req.ip);
    }
    updateStation(user, warehouseId, stationId, dto, req) {
        return this.warehouses.updateStation(user.companyId, warehouseId, stationId, user.sub, dto, req.ip);
    }
    heartbeat(user, warehouseId, stationId) {
        return this.warehouses.heartbeat(user.companyId, warehouseId, stationId);
    }
};
exports.WarehousesController = WarehousesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, warehouse_dto_1.CreateWarehouseDto, Object]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, warehouse_dto_1.UpdateWarehouseDto, Object]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':warehouseId/stations'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.supervisor, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('warehouseId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, warehouse_dto_1.CreateStationDto, Object]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "createStation", null);
__decorate([
    (0, common_1.Patch)(':warehouseId/stations/:stationId'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.supervisor, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('warehouseId')),
    __param(2, (0, common_1.Param)('stationId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, warehouse_dto_1.UpdateStationDto, Object]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "updateStation", null);
__decorate([
    (0, common_1.Post)(':warehouseId/stations/:stationId/heartbeat'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('warehouseId')),
    __param(2, (0, common_1.Param)('stationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], WarehousesController.prototype, "heartbeat", null);
exports.WarehousesController = WarehousesController = __decorate([
    (0, common_1.Controller)('warehouses'),
    __metadata("design:paramtypes", [warehouses_service_1.WarehousesService])
], WarehousesController);
//# sourceMappingURL=warehouses.controller.js.map