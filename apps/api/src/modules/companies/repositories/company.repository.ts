import { Injectable, NotFoundException } from '@nestjs/common';

import { Company, CompanyStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyQueryDto } from '../dto/company-query.dto';

import { CompanySearchResult } from '../types/company.types';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhereClause(query: CompanyQueryDto): Prisma.CompanyWhereInput {
    const where: Prisma.CompanyWhereInput = {
      isDeleted: false,
    };

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          legalName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status as CompanyStatus;
    }

    if (query.companyType) {
      where.companyType = query.companyType;
    }

    return where;
  }

  private buildOrderBy(
    query: CompanyQueryDto,
  ): Prisma.CompanyOrderByWithRelationInput {
    const sortBy = query.sortBy ?? 'createdAt';
    const mapped =
      sortBy === 'companyName'
        ? 'name'
        : sortBy === 'companyCode'
          ? 'code'
          : sortBy;

    return {
      [mapped]: query.sortOrder ?? 'desc',
    };
  }

  private pagination(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({
      data: {
        code: dto.companyCode,
        name: dto.companyName,
        legalName: dto.legalName,
        companyType: dto.companyType,
        email: dto.email,
        phone: dto.phone,
        gstNumber: dto.gstNumber,
        panNumber: dto.panNumber,
        emailVerified: dto.emailVerified ?? false,
        phoneVerified: dto.phoneVerified ?? false,
        address: dto.address as unknown as Prisma.InputJsonValue,
        contact: dto.contact as unknown as Prisma.InputJsonValue,
        branding: dto.branding as unknown as Prisma.InputJsonValue,
        subscription: dto.subscription as unknown as Prisma.InputJsonValue,
        settings: dto.settings as unknown as Prisma.InputJsonValue,
        storage: dto.storage as unknown as Prisma.InputJsonValue,
      } satisfies Prisma.CompanyUncheckedCreateInput,
    });
  }

  async findById(id: string): Promise<Company> {
    const company = await this.prisma.company.findFirst({
      where: { id, isDeleted: false },
    });

    if (!company) {
      throw new NotFoundException(`Company ${id} not found.`);
    }

    return company;
  }

  async findAll(query: CompanyQueryDto): Promise<CompanySearchResult<Company>> {
    const where = this.buildWhereClause(query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({
        where,
        orderBy: this.buildOrderBy(query),
        ...this.pagination(query.page, query.limit),
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { email, isDeleted: false },
    });
  }

  async findByGST(gstNumber: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { gstNumber, isDeleted: false },
    });
  }

  async findByPAN(panNumber: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { panNumber, isDeleted: false },
    });
  }

  async findByCompanyCode(companyCode: string): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: { code: companyCode, isDeleted: false },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.findById(id);

    const data: Prisma.CompanyUncheckedUpdateInput = {};

    if (dto.companyName !== undefined) data.name = dto.companyName;
    if (dto.companyCode !== undefined) data.code = dto.companyCode;
    if (dto.legalName !== undefined) data.legalName = dto.legalName;
    if (dto.companyType !== undefined) data.companyType = dto.companyType;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.gstNumber !== undefined) data.gstNumber = dto.gstNumber;
    if (dto.panNumber !== undefined) data.panNumber = dto.panNumber;
    if (dto.emailVerified !== undefined) data.emailVerified = dto.emailVerified;
    if (dto.phoneVerified !== undefined) data.phoneVerified = dto.phoneVerified;
    if (dto.address !== undefined) {
      data.address = dto.address as unknown as Prisma.InputJsonValue;
    }
    if (dto.contact !== undefined) {
      data.contact = dto.contact as unknown as Prisma.InputJsonValue;
    }
    if (dto.branding !== undefined) {
      data.branding = dto.branding as unknown as Prisma.InputJsonValue;
    }
    if (dto.subscription !== undefined) {
      data.subscription = dto.subscription as unknown as Prisma.InputJsonValue;
    }
    if (dto.settings !== undefined) {
      data.settings = dto.settings as unknown as Prisma.InputJsonValue;
    }
    if (dto.storage !== undefined) {
      data.storage = dto.storage as unknown as Prisma.InputJsonValue;
    }

    return this.prisma.company.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Company ${id} not found.`);
    }
    return this.prisma.company.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async delete(id: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.delete({ where: { id } });
  }

  async activate(id: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: { status: CompanyStatus.ACTIVE },
    });
  }

  async deactivate(id: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: { status: CompanyStatus.INACTIVE },
    });
  }

  async suspend(id: string, reason?: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.SUSPENDED,
        blockReason: reason,
        blockedAt: new Date(),
      },
    });
  }

  /** Schema has no BLOCKED — maps to SUSPENDED */
  async block(id: string, reason?: string): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: {
        status: CompanyStatus.SUSPENDED,
        blockReason: reason,
        blockedAt: new Date(),
      },
    });
  }

  async updateSubscription(
    id: string,
    subscription: Prisma.InputJsonValue,
  ): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: { subscription },
    });
  }

  async updateSettings(
    id: string,
    settings: Prisma.InputJsonValue,
  ): Promise<Company> {
    await this.findById(id);
    return this.prisma.company.update({
      where: { id },
      data: { settings },
    });
  }

  async increaseStorage(id: string, usedStorageGB: number): Promise<Company> {
    const company = await this.findById(id);
    const storage = (company.storage as Record<string, unknown>) ?? {};
    const current = Number(storage.usedStorageGB ?? 0);

    return this.prisma.company.update({
      where: { id },
      data: {
        storage: {
          ...storage,
          usedStorageGB: current + usedStorageGB,
        },
      },
    });
  }

  async decreaseStorage(id: string, usedStorageGB: number): Promise<Company> {
    const company = await this.findById(id);
    const storage = (company.storage as Record<string, unknown>) ?? {};
    const current = Number(storage.usedStorageGB ?? 0);

    return this.prisma.company.update({
      where: { id },
      data: {
        storage: {
          ...storage,
          usedStorageGB: Math.max(0, current - usedStorageGB),
        },
      },
    });
  }

  async totalCompanies(): Promise<number> {
    return this.prisma.company.count({ where: { isDeleted: false } });
  }

  async activeCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: { isDeleted: false, status: CompanyStatus.ACTIVE },
    });
  }

  async inactiveCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: { isDeleted: false, status: CompanyStatus.INACTIVE },
    });
  }

  async suspendedCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: { isDeleted: false, status: CompanyStatus.SUSPENDED },
    });
  }

  async trialCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        subscription: { path: ['isTrial'], equals: true },
      },
    });
  }

  async enterpriseCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        subscription: { path: ['plan'], equals: 'ENTERPRISE' },
      },
    });
  }

  async companiesByStatus(status: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        status: status as CompanyStatus,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async companiesByPlan(plan: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: { path: ['plan'], equals: plan },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async recentCompanies(limit = 10): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStatistics(companyId: string) {
    await this.findById(companyId);

    const [
      warehouses,
      users,
      orders,
      claims,
      returns,
      activeOrders,
      completedOrders,
    ] = await this.prisma.$transaction([
      this.prisma.warehouse.count({ where: { companyId } }),
      this.prisma.user.count({ where: { companyId } }),
      this.prisma.order.count({ where: { companyId } }),
      this.prisma.claim.count({ where: { companyId } }),
      this.prisma.return.count({ where: { companyId } }),
      this.prisma.order.count({
        where: {
          companyId,
          status: { notIn: ['DELIVERED', 'CANCELLED', 'RETURNED'] },
        },
      }),
      this.prisma.order.count({
        where: { companyId, status: 'DELIVERED' },
      }),
    ]);

    return {
      totalWarehouses: warehouses,
      totalUsers: users,
      totalOrders: orders,
      totalClaims: claims,
      totalReturns: returns,
      activeOrders,
      completedOrders,
      storageUsed: 0,
    };
  }

  async getDashboardSummary(companyId: string) {
    const company = await this.findById(companyId);
    const statistics = await this.getStatistics(companyId);

    return {
      company,
      statistics,
      subscription: company.subscription,
      storage: company.storage,
      settings: company.settings,
    };
  }

  async storageUsage(companyId: string) {
    const company = await this.findById(companyId);
    return company.storage;
  }

  async subscriptionSummary(companyId: string) {
    const company = await this.findById(companyId);
    return company.subscription;
  }

  async companyHealth(companyId: string) {
    const company = await this.findById(companyId);
    return {
      id: company.id,
      status: company.status,
      emailVerified: company.emailVerified,
      phoneVerified: company.phoneVerified,
      storage: company.storage,
      subscription: company.subscription,
      updatedAt: company.updatedAt,
    };
  }

  async companyOverview(companyId: string) {
    const [company, statistics] = await Promise.all([
      this.findById(companyId),
      this.getStatistics(companyId),
    ]);
    return { company, statistics };
  }

  async bulkActivate(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: { status: CompanyStatus.ACTIVE },
    });
  }

  async bulkDeactivate(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: { status: CompanyStatus.INACTIVE },
    });
  }

  async bulkSuspend(
    ids: string[],
    reason?: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: {
        status: CompanyStatus.SUSPENDED,
        blockReason: reason,
        blockedAt: new Date(),
      },
    });
  }

  async bulkSoftDelete(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async bulkRestore(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async isDuplicate(companyCode: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { code: companyCode, isDeleted: false },
    });
    return count > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { email, isDeleted: false },
    });
    return count > 0;
  }

  async gstExists(gstNumber: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { gstNumber, isDeleted: false },
    });
    return count > 0;
  }

  async panExists(panNumber: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: { panNumber, isDeleted: false },
    });
    return count > 0;
  }

  async executeTransaction<T>(
    operations: Prisma.PrismaPromise<T>[],
  ): Promise<T[]> {
    return this.prisma.$transaction(operations);
  }

  async findByCountry(country: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: { path: ['country'], equals: country },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByState(state: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: { path: ['state'], equals: state },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByCity(city: string): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: { path: ['city'], equals: city },
      },
      orderBy: { name: 'asc' },
    });
  }

  async expiringSubscriptions(expiryDate: Date): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: { path: ['expiryDate'], lte: expiryDate.toISOString() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async trialCompaniesExpiring(_expiryDate: Date): Promise<Company[]> {
    void _expiryDate;
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: { path: ['isTrial'], equals: true },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async inactiveCompaniesList(): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { isDeleted: false, status: CompanyStatus.INACTIVE },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async latestCompanies(take = 20): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async companiesNearStorageLimit(threshold = 90): Promise<Company[]> {
    const companies = await this.prisma.company.findMany({
      where: { isDeleted: false },
    });

    return companies.filter((company) => {
      const storage = (company.storage as Record<string, unknown>) ?? {};
      return Number(storage.usagePercentage ?? 0) >= threshold;
    });
  }

  async healthyCompanies(): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        status: CompanyStatus.ACTIVE,
        emailVerified: true,
        phoneVerified: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async ping(): Promise<boolean> {
    return this.healthCheck();
  }

  async count(where?: Prisma.CompanyWhereInput): Promise<number> {
    return this.prisma.company.count({ where });
  }

  async findMany(where?: Prisma.CompanyWhereInput): Promise<Company[]> {
    return this.prisma.company.findMany({ where });
  }

  async findFirst(where: Prisma.CompanyWhereInput): Promise<Company | null> {
    return this.prisma.company.findFirst({ where });
  }

  async upsert(
    where: Prisma.CompanyWhereUniqueInput,
    create: Prisma.CompanyCreateInput,
    update: Prisma.CompanyUpdateInput,
  ): Promise<Company> {
    return this.prisma.company.upsert({ where, create, update });
  }

  async createMany(
    data: Prisma.CompanyCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.createMany({ data, skipDuplicates: true });
  }

  async updateMany(
    where: Prisma.CompanyWhereInput,
    data: Prisma.CompanyUpdateManyMutationInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({ where, data });
  }

  async deleteMany(
    where: Prisma.CompanyWhereInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.deleteMany({ where });
  }
}
