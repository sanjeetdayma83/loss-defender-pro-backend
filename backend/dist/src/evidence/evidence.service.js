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
const storage_service_1 = require("../storage/storage.service");
let EvidenceService = class EvidenceService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    list(companyId) {
        return this.prisma.evidence.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async getOne(companyId, id) {
        const row = await this.prisma.evidence.findFirst({ where: { id, companyId } });
        if (!row)
            throw new common_1.NotFoundException('Evidence not found');
        return row;
    }
    async getDownloadUrl(companyId, id) {
        const row = await this.prisma.evidence.findFirst({ where: { id, companyId } });
        if (!row)
            throw new common_1.NotFoundException('Evidence not found');
        if (!row.packKey) {
            return { configured: false, downloadUrl: null, message: 'No packKey yet' };
        }
        const signed = await this.storage.presignGet(row.packKey);
        return {
            ...signed,
            evidenceId: id,
        };
    }
};
exports.EvidenceService = EvidenceService;
exports.EvidenceService = EvidenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], EvidenceService);
//# sourceMappingURL=evidence.service.js.map