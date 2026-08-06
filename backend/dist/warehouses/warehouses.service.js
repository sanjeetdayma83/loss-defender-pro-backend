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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
let WarehousesService = class WarehousesService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    list(companyId) {
        return this.prisma.warehouse.findMany({
            where: { companyId },
            include: {
                stations: {
                    select: {
                        id: true,
                        stationName: true,
                        stationId: true,
                        status: true,
                        lastHeartbeatAt: true,
                    },
                },
                _count: { select: { users: true, stations: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(companyId, id) {
        const wh = await this.prisma.warehouse.findFirst({
            where: { id, companyId },
            include: { stations: true },
        });
        if (!wh)
            throw new common_1.NotFoundException('Warehouse not found');
        return wh;
    }
    async create(companyId, actorId, dto, ip) {
        const exists = await this.prisma.warehouse.findFirst({
            where: { companyId, code: dto.code },
        });
        if (exists)
            throw new common_1.ConflictException(`Warehouse code "${dto.code}" already exists`);
        const created = await this.prisma.warehouse.create({
            data: {
                companyId,
                name: dto.name,
                code: dto.code,
                address: dto.address,
                city: dto.city,
                state: dto.state,
                country: dto.country ?? 'India',
                timezone: dto.timezone,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'warehouse.create',
            entity: 'Warehouse',
            entityId: created.id,
            after: created,
            ipAddress: ip,
        });
        return created;
    }
    async update(companyId, id, actorId, dto, ip) {
        const before = await this.prisma.warehouse.findFirst({ where: { id, companyId } });
        if (!before)
            throw new common_1.NotFoundException('Warehouse not found');
        const updated = await this.prisma.warehouse.update({
            where: { id },
            data: { ...dto, address: dto.address },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'warehouse.update',
            entity: 'Warehouse',
            entityId: id,
            before: before,
            after: updated,
            ipAddress: ip,
        });
        return updated;
    }
    async createStation(companyId, warehouseId, actorId, dto, ip) {
        const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } });
        if (!wh)
            throw new common_1.NotFoundException('Warehouse not found');
        const exists = await this.prisma.station.findFirst({
            where: { warehouseId, stationId: dto.stationId },
        });
        if (exists)
            throw new common_1.ConflictException(`Station ID "${dto.stationId}" already exists`);
        const created = await this.prisma.station.create({
            data: {
                warehouseId,
                stationName: dto.stationName,
                stationId: dto.stationId,
                camera: dto.camera,
                scanner: dto.scanner,
                printer: dto.printer,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'station.create',
            entity: 'Station',
            entityId: created.id,
            after: created,
            ipAddress: ip,
        });
        return created;
    }
    async updateStation(companyId, warehouseId, stationUuid, actorId, dto, ip) {
        const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } });
        if (!wh)
            throw new common_1.NotFoundException('Warehouse not found');
        const before = await this.prisma.station.findFirst({
            where: { id: stationUuid, warehouseId },
        });
        if (!before)
            throw new common_1.NotFoundException('Station not found');
        const updated = await this.prisma.station.update({
            where: { id: stationUuid },
            data: {
                ...dto,
                camera: dto.camera,
                scanner: dto.scanner,
                printer: dto.printer,
            },
        });
        await this.audit.log({
            companyId,
            actorId,
            action: 'station.update',
            entity: 'Station',
            entityId: stationUuid,
            before: before,
            after: updated,
            ipAddress: ip,
        });
        return updated;
    }
    async heartbeat(companyId, warehouseId, stationUuid) {
        const wh = await this.prisma.warehouse.findFirst({ where: { id: warehouseId, companyId } });
        if (!wh)
            throw new common_1.ForbiddenException('Warehouse not in your company');
        const station = await this.prisma.station.findFirst({
            where: { id: stationUuid, warehouseId },
        });
        if (!station)
            throw new common_1.NotFoundException('Station not found');
        return this.prisma.station.update({
            where: { id: stationUuid },
            data: { lastHeartbeatAt: new Date(), status: 'online' },
        });
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map