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
exports.RecordingsController = void 0;
const common_1 = require("@nestjs/common");
const recordings_service_1 = require("./recordings.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class StartRecordingDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StartRecordingDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StartRecordingDto.prototype, "warehouseId", void 0);
class StopRecordingDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StopRecordingDto.prototype, "durationSec", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], StopRecordingDto.prototype, "segmentCount", void 0);
class PresignSegmentDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PresignSegmentDto.prototype, "segmentIndex", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PresignSegmentDto.prototype, "contentType", void 0);
let RecordingsController = class RecordingsController {
    constructor(recordings) {
        this.recordings = recordings;
    }
    list(u) {
        return this.recordings.list(u.companyId);
    }
    getOne(u, id) {
        return this.recordings.getOne(u.companyId, id);
    }
    start(u, dto) {
        return this.recordings.start(u.companyId, u.sub, dto.orderId, dto.warehouseId);
    }
    stop(u, id, dto) {
        return this.recordings.stop(u.companyId, id, dto.durationSec, dto.segmentCount);
    }
    presign(u, id, dto) {
        return this.recordings.presignSegment(u.companyId, id, dto.segmentIndex, dto.contentType ?? 'video/webm');
    }
};
exports.RecordingsController = RecordingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, StartRecordingDto]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, StopRecordingDto]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "stop", null);
__decorate([
    (0, common_1.Post)(':id/segments/presign'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, PresignSegmentDto]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "presign", null);
exports.RecordingsController = RecordingsController = __decorate([
    (0, swagger_1.ApiTags)('recordings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('recordings'),
    __metadata("design:paramtypes", [recordings_service_1.RecordingsService])
], RecordingsController);
//# sourceMappingURL=recordings.controller.js.map