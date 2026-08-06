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
exports.ClaimsController = void 0;
const common_1 = require("@nestjs/common");
const claims_service_1 = require("./claims.service");
const create_claim_dto_1 = require("./dto/create-claim.dto");
const update_claim_dto_1 = require("./dto/update-claim.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
let ClaimsController = class ClaimsController {
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.companyId, dto);
    }
    list(req, status) {
        return this.service.list(req.user.companyId, status);
    }
    findOne(req, id) {
        return this.service.findOne(req.user.companyId, id);
    }
    update(req, id, dto) {
        return this.service.update(req.user.companyId, id, dto);
    }
};
exports.ClaimsController = ClaimsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_claim_dto_1.CreateClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_claim_dto_1.UpdateClaimDto]),
    __metadata("design:returntype", void 0)
], ClaimsController.prototype, "update", null);
exports.ClaimsController = ClaimsController = __decorate([
    (0, common_1.Controller)('claims'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService])
], ClaimsController);
//# sourceMappingURL=claims.controller.js.map