import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Company,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyQueryDto } from '../dto/company-query.dto';

import {
  CompanyFilter,
  CompanySearchResult,
} from '../types/company.types';

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * -------------------------------------------------------
   * BUILD WHERE CLAUSE
   * -------------------------------------------------------
   */

  private buildWhereClause(
    query: CompanyQueryDto,
  ): Prisma.CompanyWhereInput {
    const where: Prisma.CompanyWhereInput = {
      isDeleted: false,
    };

    if (query.search) {
      where.OR = [
        {
          companyName: {
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
          companyCode: {
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
      where.status = query.status;
    }

    if (query.companyType) {
      where.companyType =
        query.companyType;
    }

    return where;
  }

  /**
   * -------------------------------------------------------
   * BUILD ORDER BY
   * -------------------------------------------------------
   */

  private buildOrderBy(
    query: CompanyQueryDto,
  ): Prisma.CompanyOrderByWithRelationInput {
    return {
      [query.sortBy ?? 'createdAt']:
        query.sortOrder ?? 'desc',
    };
  }

  /**
   * -------------------------------------------------------
   * PAGINATION
   * -------------------------------------------------------
   */

  private pagination(
    page: number,
    limit: number,
  ) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * -------------------------------------------------------
   * CREATE COMPANY
   * -------------------------------------------------------
   */

  async create(
    dto: CreateCompanyDto,
  ): Promise<Company> {
    return this.prisma.company.create({
      data: dto as Prisma.CompanyCreateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<Company> {
    const company =
      await this.prisma.company.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    if (!company) {
      throw new NotFoundException(
        `Company ${id} not found.`,
      );
    }

    return company;
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(
    query: CompanyQueryDto,
  ): Promise<
    CompanySearchResult<Company>
  > {
    const where =
      this.buildWhereClause(query);

    const [data, total] =
      await this.prisma.$transaction([
        this.prisma.company.findMany({
          where,

          orderBy:
            this.buildOrderBy(query),

          ...this.pagination(
            query.page,
            query.limit,
          ),
        }),

        this.prisma.company.count({
          where,
        }),
      ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(
        total / query.limit,
      ),
    };
  }
    /**
   * -------------------------------------------------------
   * FIND BY EMAIL
   * -------------------------------------------------------
   */

  async findByEmail(
    email: string,
  ): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY GST
   * -------------------------------------------------------
   */

  async findByGST(
    gstNumber: string,
  ): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: {
        gstNumber,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY PAN
   * -------------------------------------------------------
   */

  async findByPAN(
    panNumber: string,
  ): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: {
        panNumber,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY COMPANY CODE
   * -------------------------------------------------------
   */

  async findByCompanyCode(
    companyCode: string,
  ): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where: {
        companyCode,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * EXISTS
   * -------------------------------------------------------
   */

  async exists(
    id: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.company.count({
        where: {
          id,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: dto as Prisma.CompanyUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * SOFT DELETE
   * -------------------------------------------------------
   */

  async softDelete(
    id: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RESTORE
   * -------------------------------------------------------
   */

  async restore(
    id: string,
  ): Promise<Company> {
    const company =
      await this.prisma.company.findUnique({
        where: {
          id,
        },
      });

    if (!company) {
      throw new NotFoundException(
        `Company ${id} not found.`,
      );
    }

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * HARD DELETE
   * -------------------------------------------------------
   */

  async delete(
    id: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.delete({
      where: {
        id,
      },
    });
  }
    /**
   * -------------------------------------------------------
   * ACTIVATE COMPANY
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DEACTIVATE COMPANY
   * -------------------------------------------------------
   */

  async deactivate(
    id: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * SUSPEND COMPANY
   * -------------------------------------------------------
   */

  async suspend(
    id: string,
    reason?: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        status: 'SUSPENDED',
        suspensionReason: reason,
        suspendedAt: new Date(),
      } as Prisma.CompanyUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * BLOCK COMPANY
   * -------------------------------------------------------
   */

  async block(
    id: string,
    reason?: string,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        status: 'BLOCKED',
        blockReason: reason,
        blockedAt: new Date(),
      } as Prisma.CompanyUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE SUBSCRIPTION
   * -------------------------------------------------------
   */

  async updateSubscription(
    id: string,
    subscription: Prisma.InputJsonValue,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        subscription,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE SETTINGS
   * -------------------------------------------------------
   */

  async updateSettings(
    id: string,
    settings: Prisma.InputJsonValue,
  ): Promise<Company> {
    await this.findById(id);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        settings,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * INCREASE STORAGE
   * -------------------------------------------------------
   */

  async increaseStorage(
    id: string,
    usedStorageGB: number,
  ): Promise<Company> {
    const company =
      await this.findById(id);

    const storage =
      (company.storage as any) ?? {};

    const current =
      Number(storage.usedStorageGB ?? 0);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        storage: {
          ...(storage as object),
          usedStorageGB:
            current + usedStorageGB,
        } as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DECREASE STORAGE
   * -------------------------------------------------------
   */

  async decreaseStorage(
    id: string,
    usedStorageGB: number,
  ): Promise<Company> {
    const company =
      await this.findById(id);

    const storage =
      (company.storage as any) ?? {};

    const current =
      Number(storage.usedStorageGB ?? 0);

    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        storage: {
          ...(storage as object),
          usedStorageGB: Math.max(
            0,
            current - usedStorageGB,
          ),
        } as Prisma.InputJsonValue,
      },
    });
  }
    /**
   * -------------------------------------------------------
   * TOTAL COMPANIES
   * -------------------------------------------------------
   */

  async totalCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ACTIVE COMPANIES
   * -------------------------------------------------------
   */

  async activeCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * INACTIVE COMPANIES
   * -------------------------------------------------------
   */

  async inactiveCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        status: 'INACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * SUSPENDED COMPANIES
   * -------------------------------------------------------
   */

  async suspendedCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        status: 'SUSPENDED',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * TRIAL COMPANIES
   * -------------------------------------------------------
   */

  async trialCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        subscription: {
          path: ['isTrial'],
          equals: true,
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ENTERPRISE COMPANIES
   * -------------------------------------------------------
   */

  async enterpriseCompanies(): Promise<number> {
    return this.prisma.company.count({
      where: {
        isDeleted: false,
        subscription: {
          path: ['plan'],
          equals: 'ENTERPRISE',
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * COMPANIES BY STATUS
   * -------------------------------------------------------
   */

  async companiesByStatus(
    status: string,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        status,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * COMPANIES BY SUBSCRIPTION PLAN
   * -------------------------------------------------------
   */

  async companiesByPlan(
    plan: string,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: {
          path: ['plan'],
          equals: plan,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RECENT COMPANIES
   * -------------------------------------------------------
   */

  async recentCompanies(
    limit = 10,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
    /**
   * -------------------------------------------------------
   * COMPANY STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(
    companyId: string,
  ) {
    await this.findById(companyId);

    const [
      warehouses,
      users,
      orders,
      claims,
      returns,
    ] = await this.prisma.$transaction([
      this.prisma.warehouse.count({
        where: {
          companyId,
        },
      }),

      this.prisma.user.count({
        where: {
          companyId,
        },
      }),

      this.prisma.order.count({
        where: {
          companyId,
        },
      }),

      this.prisma.claim.count({
        where: {
          companyId,
        },
      }),

      this.prisma.return.count({
        where: {
          companyId,
        },
      }),
    ]);

    return {
      totalWarehouses: warehouses,
      totalUsers: users,
      totalOrders: orders,
      totalClaims: claims,
      totalReturns: returns,
    };
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD SUMMARY
   * -------------------------------------------------------
   */

  async getDashboardSummary(
    companyId: string,
  ) {
    const company =
      await this.findById(companyId);

    const statistics =
      await this.getStatistics(
        companyId,
      );

    return {
      company,
      statistics,
      subscription:
        company.subscription,
      storage:
        company.storage,
      settings:
        company.settings,
    };
  }

  /**
   * -------------------------------------------------------
   * STORAGE USAGE
   * -------------------------------------------------------
   */

  async storageUsage(
    companyId: string,
  ) {
    const company =
      await this.findById(companyId);

    return company.storage;
  }

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION SUMMARY
   * -------------------------------------------------------
   */

  async subscriptionSummary(
    companyId: string,
  ) {
    const company =
      await this.findById(companyId);

    return company.subscription;
  }

  /**
   * -------------------------------------------------------
   * COMPANY HEALTH
   * -------------------------------------------------------
   */

  async companyHealth(
    companyId: string,
  ) {
    const company =
      await this.findById(companyId);

    return {
      id: company.id,
      status: company.status,
      emailVerified:
        company.emailVerified,
      phoneVerified:
        company.phoneVerified,
      storage:
        company.storage,
      subscription:
        company.subscription,
      updatedAt:
        company.updatedAt,
    };
  }

  /**
   * -------------------------------------------------------
   * COMPANY OVERVIEW
   * -------------------------------------------------------
   */

  async companyOverview(
    companyId: string,
  ) {
    const [
      company,
      statistics,
    ] = await Promise.all([
      this.findById(companyId),
      this.getStatistics(
        companyId,
      ),
    ]);

    return {
      company,
      statistics,
    };
  }
    /**
   * -------------------------------------------------------
   * BULK ACTIVATE
   * -------------------------------------------------------
   */

  async bulkActivate(
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: {
        id: {
          in: ids,
        },
        isDeleted: false,
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK DEACTIVATE
   * -------------------------------------------------------
   */

  async bulkDeactivate(
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: {
        id: {
          in: ids,
        },
        isDeleted: false,
      },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK SUSPEND
   * -------------------------------------------------------
   */

  async bulkSuspend(
    ids: string[],
    reason?: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: {
        id: {
          in: ids,
        },
        isDeleted: false,
      },
      data: {
        status: 'SUSPENDED',
        suspensionReason: reason,
        suspendedAt: new Date(),
      } as Prisma.CompanyUpdateManyMutationInput,
    });
  }

  /**
   * -------------------------------------------------------
   * BULK SOFT DELETE
   * -------------------------------------------------------
   */

  async bulkSoftDelete(
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK RESTORE
   * -------------------------------------------------------
   */

  async bulkRestore(
    ids: string[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE CHECK
   * -------------------------------------------------------
   */

  async isDuplicate(
    companyCode: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.company.count({
        where: {
          companyCode,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE EMAIL
   * -------------------------------------------------------
   */

  async emailExists(
    email: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.company.count({
        where: {
          email,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE GST
   * -------------------------------------------------------
   */

  async gstExists(
    gstNumber: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.company.count({
        where: {
          gstNumber,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE PAN
   * -------------------------------------------------------
   */

  async panExists(
    panNumber: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.company.count({
        where: {
          panNumber,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * EXECUTE TRANSACTION
   * -------------------------------------------------------
   */

  async executeTransaction<T>(
    operations: Prisma.PrismaPromise<T>[],
  ): Promise<T[]> {
    return this.prisma.$transaction(
      operations,
    );
  }
    /**
   * -------------------------------------------------------
   * FIND BY COUNTRY
   * -------------------------------------------------------
   */

  async findByCountry(
    country: string,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: {
          path: ['country'],
          equals: country,
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY STATE
   * -------------------------------------------------------
   */

  async findByState(
    state: string,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: {
          path: ['state'],
          equals: state,
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY CITY
   * -------------------------------------------------------
   */

  async findByCity(
    city: string,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        address: {
          path: ['city'],
          equals: city,
        },
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * EXPIRING SUBSCRIPTIONS
   * -------------------------------------------------------
   */

  async expiringSubscriptions(
    expiryDate: Date,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: {
          path: ['expiryDate'],
          lte: expiryDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * TRIAL COMPANIES
   * -------------------------------------------------------
   */

  async trialCompaniesExpiring(
    expiryDate: Date,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        subscription: {
          path: ['isTrial'],
          equals: true,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * INACTIVE COMPANIES
   * -------------------------------------------------------
   */

  async inactiveCompaniesList(): Promise<
    Company[]
  > {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        status: 'INACTIVE',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * LATEST COMPANIES
   * -------------------------------------------------------
   */

  async latestCompanies(
    take = 20,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take,
    });
  }

  /**
   * -------------------------------------------------------
   * STORAGE THRESHOLD
   * -------------------------------------------------------
   */

  async companiesNearStorageLimit(
    threshold = 90,
  ): Promise<Company[]> {
    const companies =
      await this.prisma.company.findMany({
        where: {
          isDeleted: false,
        },
      });

    return companies.filter((company) => {
      const storage =
        (company.storage as any) ?? {};

      return (
        Number(
          storage.usagePercentage ?? 0,
        ) >= threshold
      );
    });
  }

  /**
   * -------------------------------------------------------
   * HEALTHY COMPANIES
   * -------------------------------------------------------
   */

  async healthyCompanies(): Promise<
    Company[]
  > {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });
  }
    /**
   * -------------------------------------------------------
   * DATABASE HEALTH CHECK
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * -------------------------------------------------------
   * DATABASE PING
   * -------------------------------------------------------
   */

  async ping(): Promise<boolean> {
    return this.healthCheck();
  }

  /**
   * -------------------------------------------------------
   * COMPANY COUNT
   * -------------------------------------------------------
   */

  async count(
    where?: Prisma.CompanyWhereInput,
  ): Promise<number> {
    return this.prisma.company.count({
      where,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND MANY
   * -------------------------------------------------------
   */

  async findMany(
    where?: Prisma.CompanyWhereInput,
  ): Promise<Company[]> {
    return this.prisma.company.findMany({
      where,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND FIRST
   * -------------------------------------------------------
   */

  async findFirst(
    where: Prisma.CompanyWhereInput,
  ): Promise<Company | null> {
    return this.prisma.company.findFirst({
      where,
    });
  }

  /**
   * -------------------------------------------------------
   * UPSERT
   * -------------------------------------------------------
   */

  async upsert(
    where: Prisma.CompanyWhereUniqueInput,
    create: Prisma.CompanyCreateInput,
    update: Prisma.CompanyUpdateInput,
  ): Promise<Company> {
    return this.prisma.company.upsert({
      where,
      create,
      update,
    });
  }

  /**
   * -------------------------------------------------------
   * BULK CREATE
   * -------------------------------------------------------
   */

  async createMany(
    data: Prisma.CompanyCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * -------------------------------------------------------
   * BULK UPDATE
   * -------------------------------------------------------
   */

  async updateMany(
    where: Prisma.CompanyWhereInput,
    data: Prisma.CompanyUpdateManyMutationInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.updateMany({
      where,
      data,
    });
  }

  /**
   * -------------------------------------------------------
   * BULK DELETE
   * -------------------------------------------------------
   */

  async deleteMany(
    where: Prisma.CompanyWhereInput,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.company.deleteMany({
      where,
    });
  }
}