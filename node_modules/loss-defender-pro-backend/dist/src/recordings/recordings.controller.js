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
const start_recording_dto_1 = require("./dto/start-recording.dto");
const add_segment_dto_1 = require("./dto/add-segment.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../common/guards/tenant.guard");
let RecordingsController = class RecordingsController {
    constructor(service) {
        this.service = service;
    }
    start(req, dto) {
        return this.service.start(req.user.companyId, req.user.sub ?? req.user.id, dto);
    }
    pause(req, id) {
        return this.service.pause(req.user.companyId, id);
    }
    resume(req, id) {
        return this.service.resume(req.user.companyId, id);
    }
    stop(req, id) {
        return this.service.stop(req.user.companyId, id);
    }
    addSegment(req, id, dto) {
        return this.service.addSegment(req.user.companyId, id, dto);
    }
    findOne(req, id) {
        return this.service.findOne(req.user.companyId, id);
    }
    list(req, orderId) {
        return this.service.list(req.user.companyId, orderId);
    }
};
exports.RecordingsController = RecordingsController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_recording_dto_1.StartRecordingDto]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/pause'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "pause", null);
__decorate([
    (0, common_1.Post)(':id/resume'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "resume", null);
__decorate([
    (0, common_1.Post)(':id/stop'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "stop", null);
__decorate([
    (0, common_1.Post)(':id/segments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_segment_dto_1.AddSegmentDto]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "addSegment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecordingsController.prototype, "list", null);
exports.RecordingsController = RecordingsController = __decorate([
    (0, common_1.Controller)('recordings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [recordings_service_1.RecordingsService])
], RecordingsController);
//# sourceMappingURL=recordings.controller.js.map