import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';

@Injectable()
export class ReportsRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private buildDateWhere(query: ReportQueryDto) {
    const where: Prisma.OrderWhereInput = {};

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    return where;
  }

  async dashboard(query: ReportQueryDto) {
    const where = this.buildDateWhere(query);

    const [orders, scans, claims, returns, users, warehouses] =
      await this.prisma.$transaction([
        this.prisma.order.count({ where }),
        this.prisma.scanner.count({
          where: { companyId: query.companyId },
        }),
        this.prisma.claim.count({
          where: { companyId: query.companyId },
        }),
        this.prisma.return.count({
          where: { companyId: query.companyId },
        }),
        this.prisma.user.count({
          where: { companyId: query.companyId },
        }),
        this.prisma.warehouse.count({
          where: { companyId: query.companyId },
        }),
      ]);

    return { orders, scans, claims, returns, users, warehouses };
  }

  async warehouse(query: ReportQueryDto) {
    return this.prisma.warehouse.findMany({
      where: { companyId: query.companyId },
      include: {
        // no User[] relation on Warehouse — only orders
        orders: true,
      },
    });
  }

  async scanner(query: ReportQueryDto) {
    return this.prisma.scanner.findMany({
      where: { companyId: query.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async users(query: ReportQueryDto) {
    return this.prisma.user.findMany({
      where: { companyId: query.companyId },
      orderBy: { lastLoginAt: 'desc' },
    });
  }

  async claims(query: ReportQueryDto) {
    return this.prisma.claim.findMany({
      where: { companyId: query.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async returns(query: ReportQueryDto) {
    return this.prisma.return.findMany({
      where: { companyId: query.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        companyId: dto.companyId,
        warehouseId: dto.warehouseId,
        generatedBy: dto.generatedBy,
        reportType: dto.reportType,
        reportName: dto.reportName,
        description: dto.description,
        dateRange: dto.dateRange as unknown as Prisma.InputJsonValue,
        exportFormat: dto.exportFormat,
        isScheduled: dto.isScheduled ?? false,
        scheduleCron: dto.scheduleCron,
      } satisfies Prisma.ReportUncheckedCreateInput,
    });
  }

  async findById(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report ${id} not found.`);
    }

    return report;
  }

  async update(id: string, dto: UpdateReportDto) {
    await this.findById(id);

    return this.prisma.report.update({
      where: { id },
      data: dto as Prisma.ReportUncheckedUpdateInput,
    });
  }

  async delete(id: string) {
    await this.findById(id);

    return this.prisma.report.delete({
      where: { id },
    });
  }

  async getKPI(query: ReportQueryDto) {
    const dashboard = await this.dashboard(query);

    const scanAccuracy =
      dashboard.scans === 0
        ? 0
        : Number(
            (
              ((dashboard.scans - dashboard.claims) /
                dashboard.scans) *
              100
            ).toFixed(2),
          );

    const claimRate =
      dashboard.orders === 0
        ? 0
        : Number(
            ((dashboard.claims / dashboard.orders) * 100).toFixed(2),
          );

    const returnRate =
      dashboard.orders === 0
        ? 0
        : Number(
            ((dashboard.returns / dashboard.orders) * 100).toFixed(2),
          );

    return {
      scanAccuracy,
      claimRate,
      returnRate,
      totalOrders: dashboard.orders,
      totalScans: dashboard.scans,
    };
  }

  async exportJSON(query: ReportQueryDto) {
    return this.dashboard(query);
  }

  async exportCSV(query: ReportQueryDto) {
    return this.dashboard(query);
  }

  async exportExcel(query: ReportQueryDto) {
    return this.dashboard(query);
  }

  async exportPDF(query: ReportQueryDto) {
    return this.dashboard(query);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async healthCheck(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }

  async ping() {
    return {
      module: 'ReportsRepository',
      status: 'OK',
      timestamp: new Date(),
    };
  }

  count(where?: Prisma.ReportWhereInput) {
    return this.prisma.report.count({ where });
  }

  findMany(args: Prisma.ReportFindManyArgs) {
    return this.prisma.report.findMany(args);
  }

  findFirst(args: Prisma.ReportFindFirstArgs) {
    return this.prisma.report.findFirst(args);
  }

  createMany(args: Prisma.ReportCreateManyArgs) {
    return this.prisma.report.createMany(args);
  }

  upsert(args: Prisma.ReportUpsertArgs) {
    return this.prisma.report.upsert(args);
  }

  transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(callback);
  }
}