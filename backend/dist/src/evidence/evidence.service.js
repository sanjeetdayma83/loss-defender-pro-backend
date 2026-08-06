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
exports.EvidenceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EvidenceService = class EvidenceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(companyId, id) {
        const ev = await this.prisma.evidence.findFirst({
            where: { id, companyId },
            include: {
                frames: { orderBy: { sequence: 'asc' } },
                recording: {
                    select: {
                        id: true,
                        status: true,
                        durationSec: true,
                        startedAt: true,
                        completedAt: true,
                        operator: { select: { id: true, name: true } },
                    },
                },
                order: {
                    select: { id: true, marketplaceOrderId: true, status: true },
                },
            },
        });
        if (!ev)
            throw new common_1.NotFoundException('Evidence not found');
        return ev;
    }
    async list(companyId, orderId) {
        return this.prisma.evidence.findMany({
            where: {
                companyId,
                ...(orderId ? { orderId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            include: {
                recording: { select: { id: true, status: true, durationSec: true } },
                order: { select: { id: true, marketplaceOrderId: true } },
            },
            take: 50,
        });
    }
};
exports.EvidenceService = EvidenceService;
exports.EvidenceService = EvidenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EvidenceService);
//# sourceMappingURL=evidence.service.js.map