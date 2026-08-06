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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const user_dto_1 = require("./dto/user.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    constructor(users) {
        this.users = users;
    }
    list(user) {
        return this.users.list(user.companyId);
    }
    me(user) {
        return this.users.me(user.sub, user.companyId);
    }
    getOne(user, id) {
        return this.users.getOne(user.companyId, id);
    }
    invite(user, dto, req) {
        return this.users.invite(user.companyId, user.sub, dto, req.ip);
    }
    updateMe(user, dto, req) {
        const safe = { name: dto.name, phone: dto.phone };
        return this.users.update(user.companyId, user.sub, user.sub, safe, req.ip);
    }
    update(user, id, dto, req) {
        return this.users.update(user.companyId, id, user.sub, dto, req.ip);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.supervisor, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.InviteUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "invite", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.owner, client_1.Role.manager, client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map