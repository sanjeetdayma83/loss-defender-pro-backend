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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("./storage.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class PresignUploadDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], PresignUploadDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], PresignUploadDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsIn)(["evidence", "recording", "profile", "claim"]),
    __metadata("design:type", String)
], PresignUploadDto.prototype, "purpose", void 0);
class PresignDownloadDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], PresignDownloadDto.prototype, "key", void 0);
let StorageController = class StorageController {
    constructor(storage) {
        this.storage = storage;
    }
    status() {
        return { configured: this.storage.isConfigured() };
    }
    presignUpload(user, dto) {
        return this.storage.getUploadUrl({
            companyId: user.companyId,
            purpose: dto.purpose,
            filename: dto.filename,
            contentType: dto.contentType,
        });
    }
    presignDownload(dto) {
        return this.storage.getDownloadUrl(dto.key);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Get)("status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "status", null);
__decorate([
    (0, common_1.Post)("presign-upload"),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.supervisor, client_1.Role.packing_operator, client_1.Role.qc_operator, client_1.Role.claims_executive, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, PresignUploadDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "presignUpload", null);
__decorate([
    (0, common_1.Post)("presign-download"),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.supervisor, client_1.Role.packing_operator, client_1.Role.qc_operator, client_1.Role.claims_executive, client_1.Role.viewer, client_1.Role.auditor, client_1.Role.super_admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PresignDownloadDto]),
    __metadata("design:returntype", void 0)
], StorageController.prototype, "presignDownload", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.Controller)("storage"),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map