"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantWhere = tenantWhere;
exports.assertSameTenant = assertSameTenant;
const common_1 = require("@nestjs/common");
function tenantWhere(companyId, extra = {}) {
    if (!companyId)
        throw new common_1.ForbiddenException('Tenant context missing');
    return { companyId, ...extra };
}
function assertSameTenant(resourceCompanyId, jwtCompanyId) {
    if (resourceCompanyId !== jwtCompanyId) {
        throw new common_1.ForbiddenException('Cross-tenant access denied');
    }
}
//# sourceMappingURL=tenant.js.map