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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ALLOWED = {
    open: ['under_review', 'approved', 'rejected', 'closed'],
    under_review: ['approved', 'rejected', 'closed'],
    approved: ['closed'],
    rejected: ['closed'],
    closed: [],
    pending: ['under_review', 'approved', 'rejected', 'closed'],
};
let ClaimsService = class ClaimsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(companyId) {
        return this.prisma.claim.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getOne(companyId, id) {
        const row = await this.prisma.claim.findFirst({ where: { id, companyId } });
        if (!row)
            throw new common_1.NotFoundException('Claim not found');
        return row;
    }
    async updateStatus(companyId, actorId, id, status, decisionNote) {
        const row = await this.prisma.claim.findFirst({ where: { id, companyId } });
        if (!row)
            throw new common_1.NotFoundException('Claim not found');
        const cur = row.status || 'open';
        const next = ALLOWED[cur] || ALLOWED['open'] || [];
        if (!next.includes(status) && cur !== status) {
            throw new common_1.BadRequestException(`Cannot transition ${cur} → ${status}. Allowed: ${next.join(', ') || 'none'}`);
        }
        const data = { status };
        if (decisionNote)
            data.decisionNote = decisionNote;
        if (status === 'closed' || status === 'approved' || status === 'rejected') {
            data.closedAt = new Date();
        }
        const updated = await this.prisma.claim.update({ where: { id }, data });
        await this.writeAudit(companyId, actorId, 'claim.status', 'Claim', id, { from: cur, to: status });
        return updated;
    }
    async writeAudit(companyId, actorId, action, entity, entityId, meta) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    companyId,
                    actorId,
                    action,
                    entity,
                    entityId,
                    meta: meta ?? {},
                },
            });
        }
        catch (_) { }
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map