import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';

import { Company } from '@prisma/client';

import { CompanyRepository } from '../repositories/company.repository';

import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyQueryDto } from '../dto/company-query.dto';

import {
  CompanyDashboardSummary,
  CompanySearchResult,
  CompanySettings,
  CompanyStatistics,
  SubscriptionDetails,
} from '../types/company.types';

@Injectable()
export class CompanyService {
  private readonly logger =
    new Logger(CompanyService.name);

  constructor(
    private readonly repository: CompanyRepository,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE COMPANY
   * -------------------------------------------------------
   */

  async create(
    dto: CreateCompanyDto,
  ): Promise<Company> {
    if (
      await this.repository.emailExists(
        dto.email,
      )
    ) {
      throw new BadRequestException(
        'Company email already exists.',
      );
    }

    if (
      await this.repository.isDuplicate(
        dto.companyCode,
      )
    ) {
      throw new BadRequestException(
        'Company code already exists.',
      );
    }

    if (
      dto.gstNumber &&
      (await this.repository.gstExists(
        dto.gstNumber,
      ))
    ) {
      throw new BadRequestException(
        'GST number already exists.',
      );
    }

    if (
      dto.panNumber &&
      (await this.repository.panExists(
        dto.panNumber,
      ))
    ) {
      throw new BadRequestException(
        'PAN number already exists.',
      );
    }

    this.logger.log(
      `Creating company ${dto.companyName}`,
    );

    return this.repository.create(dto);
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<Company> {
    return this.repository.findById(id);
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
    return this.repository.findAll(
      query,
    );
  }

  /**
   * -------------------------------------------------------
   * EXISTS
   * -------------------------------------------------------
   */

  async exists(
    id: string,
  ): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * -------------------------------------------------------
   * FIND BY EMAIL
   * -------------------------------------------------------
   */

  async findByEmail(
    email: string,
  ): Promise<Company | null> {
    return this.repository.findByEmail(
      email,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY GST
   * -------------------------------------------------------
   */

  async findByGST(
    gst: string,
  ): Promise<Company | null> {
    return this.repository.findByGST(
      gst,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY PAN
   * -------------------------------------------------------
   */

  async findByPAN(
    pan: string,
  ): Promise<Company | null> {
    return this.repository.findByPAN(
      pan,
    );
  }
    /**
   * -------------------------------------------------------
   * UPDATE COMPANY
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.repository.findById(id);

    if (
      dto.email &&
      (await this.repository.emailExists(
        dto.email,
      ))
    ) {
      const existing =
        await this.repository.findByEmail(
          dto.email,
        );

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Company email already exists.',
        );
      }
    }

    if (
      dto.gstNumber &&
      (await this.repository.gstExists(
        dto.gstNumber,
      ))
    ) {
      const existing =
        await this.repository.findByGST(
          dto.gstNumber,
        );

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'GST number already exists.',
        );
      }
    }

    if (
      dto.panNumber &&
      (await this.repository.panExists(
        dto.panNumber,
      ))
    ) {
      const existing =
        await this.repository.findByPAN(
          dto.panNumber,
        );

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'PAN number already exists.',
        );
      }
    }

    this.logger.log(
      `Updating company ${id}`,
    );

    return this.repository.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * REMOVE COMPANY
   * -------------------------------------------------------
   */

  async remove(
    id: string,
  ): Promise<Company> {
    this.logger.warn(
      `Soft deleting company ${id}`,
    );

    return this.repository.softDelete(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * RESTORE COMPANY
   * -------------------------------------------------------
   */

  async restore(
    id: string,
  ): Promise<Company> {
    this.logger.log(
      `Restoring company ${id}`,
    );

    return this.repository.restore(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * ACTIVATE COMPANY
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<Company> {
    this.logger.log(
      `Activating company ${id}`,
    );

    return this.repository.activate(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * DEACTIVATE COMPANY
   * -------------------------------------------------------
   */

  async deactivate(
    id: string,
  ): Promise<Company> {
    this.logger.log(
      `Deactivating company ${id}`,
    );

    return this.repository.deactivate(
      id,
    );
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
    this.logger.warn(
      `Suspending company ${id}`,
    );

    return this.repository.suspend(
      id,
      reason,
    );
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
    this.logger.warn(
      `Blocking company ${id}`,
    );

    return this.repository.block(
      id,
      reason,
    );
  }
    /**
   * -------------------------------------------------------
   * UPDATE SUBSCRIPTION
   * -------------------------------------------------------
   */

  async updateSubscription(
    id: string,
    subscription: SubscriptionDetails,
  ): Promise<Company> {
    await this.repository.findById(id);

    if (
      subscription.expiryDate <=
      subscription.startDate
    ) {
      throw new BadRequestException(
        'Subscription expiry date must be after the start date.',
      );
    }

    this.logger.log(
      `Updating subscription for company ${id}`,
    );

    return this.repository.updateSubscription(
      id,
      subscription as any,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE SETTINGS
   * -------------------------------------------------------
   */

  async updateSettings(
    id: string,
    settings: CompanySettings,
  ): Promise<Company> {
    await this.repository.findById(id);

    this.logger.log(
      `Updating settings for company ${id}`,
    );

    return this.repository.updateSettings(
      id,
      settings as any,
    );
  }

  /**
   * -------------------------------------------------------
   * INCREASE STORAGE
   * -------------------------------------------------------
   */

  async increaseStorage(
    id: string,
    gb: number,
  ): Promise<Company> {
    if (gb <= 0) {
      throw new BadRequestException(
        'Storage value must be greater than zero.',
      );
    }

    this.logger.log(
      `Increasing storage for company ${id} by ${gb} GB`,
    );

    return this.repository.increaseStorage(
      id,
      gb,
    );
  }

  /**
   * -------------------------------------------------------
   * DECREASE STORAGE
   * -------------------------------------------------------
   */

  async decreaseStorage(
    id: string,
    gb: number,
  ): Promise<Company> {
    if (gb <= 0) {
      throw new BadRequestException(
        'Storage value must be greater than zero.',
      );
    }

    this.logger.log(
      `Decreasing storage for company ${id} by ${gb} GB`,
    );

    return this.repository.decreaseStorage(
      id,
      gb,
    );
  }

  /**
   * -------------------------------------------------------
   * STORAGE SUMMARY
   * -------------------------------------------------------
   */

  async storageSummary(
    id: string,
  ) {
    await this.repository.findById(id);

    return this.repository.storageUsage(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION SUMMARY
   * -------------------------------------------------------
   */

  async subscriptionSummary(
    id: string,
  ) {
    await this.repository.findById(id);

    return this.repository.subscriptionSummary(
      id,
    );
  }
    /**
   * -------------------------------------------------------
   * COMPANY STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(
    id: string,
  ): Promise<CompanyStatistics> {
    await this.repository.findById(id);

    return this.repository.getStatistics(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY DASHBOARD
   * -------------------------------------------------------
   */

  async getDashboard(
  id: string,
): Promise<CompanyDashboardSummary> {
  await this.repository.findById(id);

  return this.repository.getDashboardSummary(
    id,
  ) as unknown as CompanyDashboardSummary;
}
  /**
   * -------------------------------------------------------
   * COMPANY OVERVIEW
   * -------------------------------------------------------
   */

  async companyOverview(
    id: string,
  ) {
    await this.repository.findById(id);

    return this.repository.companyOverview(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY HEALTH
   * -------------------------------------------------------
   */

  async companyHealth(
    id: string,
  ) {
    await this.repository.findById(id);

    return this.repository.companyHealth(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * TOTAL COMPANIES
   * -------------------------------------------------------
   */

  async totalCompanies(): Promise<number> {
    return this.repository.totalCompanies();
  }

  /**
   * -------------------------------------------------------
   * ACTIVE COMPANIES
   * -------------------------------------------------------
   */

  async activeCompanies(): Promise<number> {
    return this.repository.activeCompanies();
  }

  /**
   * -------------------------------------------------------
   * SUSPENDED COMPANIES
   * -------------------------------------------------------
   */

  async suspendedCompanies(): Promise<number> {
    return this.repository.suspendedCompanies();
  }

  /**
   * -------------------------------------------------------
   * ENTERPRISE COMPANIES
   * -------------------------------------------------------
   */

  async enterpriseCompanies(): Promise<number> {
    return this.repository.enterpriseCompanies();
  }

  /**
   * -------------------------------------------------------
   * TRIAL COMPANIES
   * -------------------------------------------------------
   */

  async trialCompanies(): Promise<number> {
    return this.repository.trialCompanies();
  }

  /**
   * -------------------------------------------------------
   * RECENT COMPANIES
   * -------------------------------------------------------
   */

  async recentCompanies(
    limit = 10,
  ): Promise<Company[]> {
    return this.repository.recentCompanies(
      limit,
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
    return this.repository.findByCountry(
      country,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY STATE
   * -------------------------------------------------------
   */

  async findByState(
    state: string,
  ): Promise<Company[]> {
    return this.repository.findByState(
      state,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY CITY
   * -------------------------------------------------------
   */

  async findByCity(
    city: string,
  ): Promise<Company[]> {
    return this.repository.findByCity(
      city,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANIES BY STATUS
   * -------------------------------------------------------
   */

  async companiesByStatus(
    status: string,
  ): Promise<Company[]> {
    return this.repository.companiesByStatus(
      status,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANIES BY SUBSCRIPTION PLAN
   * -------------------------------------------------------
   */

  async companiesByPlan(
    plan: string,
  ): Promise<Company[]> {
    return this.repository.companiesByPlan(
      plan,
    );
  }

  /**
   * -------------------------------------------------------
   * HEALTHY COMPANIES
   * -------------------------------------------------------
   */

  async healthyCompanies(): Promise<
    Company[]
  > {
    return this.repository.healthyCompanies();
  }

  /**
   * -------------------------------------------------------
   * COMPANIES NEAR STORAGE LIMIT
   * -------------------------------------------------------
   */

  async companiesNearStorageLimit(
    threshold = 90,
  ): Promise<Company[]> {
    return this.repository.companiesNearStorageLimit(
      threshold,
    );
  }

  /**
   * -------------------------------------------------------
   * EXPIRING SUBSCRIPTIONS
   * -------------------------------------------------------
   */

  async expiringSubscriptions(
    expiryDate: Date,
  ): Promise<Company[]> {
    return this.repository.expiringSubscriptions(
      expiryDate,
    );
  }

  /**
   * -------------------------------------------------------
   * TRIAL COMPANIES EXPIRING
   * -------------------------------------------------------
   */

  async trialCompaniesExpiring(
    expiryDate: Date,
  ): Promise<Company[]> {
    return this.repository.trialCompaniesExpiring(
      expiryDate,
    );
  }

  /**
   * -------------------------------------------------------
   * INACTIVE COMPANIES
   * -------------------------------------------------------
   */

  async inactiveCompaniesList(): Promise<
    Company[]
  > {
    return this.repository.inactiveCompaniesList();
  }

  /**
   * -------------------------------------------------------
   * LATEST COMPANIES
   * -------------------------------------------------------
   */

  async latestCompanies(
    take = 20,
  ): Promise<Company[]> {
    return this.repository.latestCompanies(
      take,
    );
  }
    /**
   * -------------------------------------------------------
   * BULK ACTIVATE
   * -------------------------------------------------------
   */

  async bulkActivate(
    ids: string[],
  ) {
    if (!ids.length) {
      throw new BadRequestException(
        'No companies selected.',
      );
    }

    this.logger.log(
      `Bulk activate ${ids.length} companies`,
    );

    return this.repository.bulkActivate(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK DEACTIVATE
   * -------------------------------------------------------
   */

  async bulkDeactivate(
    ids: string[],
  ) {
    if (!ids.length) {
      throw new BadRequestException(
        'No companies selected.',
      );
    }

    return this.repository.bulkDeactivate(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK SUSPEND
   * -------------------------------------------------------
   */

  async bulkSuspend(
    ids: string[],
    reason?: string,
  ) {
    if (!ids.length) {
      throw new BadRequestException(
        'No companies selected.',
      );
    }

    return this.repository.bulkSuspend(
      ids,
      reason,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK SOFT DELETE
   * -------------------------------------------------------
   */

  async bulkRemove(
    ids: string[],
  ) {
    if (!ids.length) {
      throw new BadRequestException(
        'No companies selected.',
      );
    }

    return this.repository.bulkSoftDelete(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK RESTORE
   * -------------------------------------------------------
   */

  async bulkRestore(
    ids: string[],
  ) {
    if (!ids.length) {
      throw new BadRequestException(
        'No companies selected.',
      );
    }

    return this.repository.bulkRestore(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE COMPANY CODE
   * -------------------------------------------------------
   */

  async companyCodeExists(
    companyCode: string,
  ): Promise<boolean> {
    return this.repository.isDuplicate(
      companyCode,
    );
  }

  /**
   * -------------------------------------------------------
   * EMAIL EXISTS
   * -------------------------------------------------------
   */

  async emailExists(
    email: string,
  ): Promise<boolean> {
    return this.repository.emailExists(
      email,
    );
  }

  /**
   * -------------------------------------------------------
   * GST EXISTS
   * -------------------------------------------------------
   */

  async gstExists(
    gstNumber: string,
  ): Promise<boolean> {
    return this.repository.gstExists(
      gstNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * PAN EXISTS
   * -------------------------------------------------------
   */

  async panExists(
    panNumber: string,
  ): Promise<boolean> {
    return this.repository.panExists(
      panNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * EXECUTE TRANSACTION
   * -------------------------------------------------------
   */

  async executeTransaction<T>(
    operations: any[],
  ): Promise<T[]> {
    return this.repository.executeTransaction(
      operations,
    );
  }
    /**
   * -------------------------------------------------------
   * HEALTH CHECK
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  /**
   * -------------------------------------------------------
   * DATABASE PING
   * -------------------------------------------------------
   */

  async ping(): Promise<boolean> {
    return this.repository.ping();
  }

  /**
   * -------------------------------------------------------
   * TOTAL RECORDS
   * -------------------------------------------------------
   */

  async count(): Promise<number> {
    return this.repository.count({
      isDeleted: false,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND MANY
   * -------------------------------------------------------
   */

  async findMany(): Promise<Company[]> {
    return this.repository.findMany({
      isDeleted: false,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND FIRST
   * -------------------------------------------------------
   */

  async findFirst(
    where: Parameters<
      CompanyRepository['findFirst']
    >[0],
  ): Promise<Company | null> {
    return this.repository.findFirst(
      where,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY EXISTS BY EMAIL
   * -------------------------------------------------------
   */

  async existsByEmail(
    email: string,
  ): Promise<boolean> {
    return this.repository.emailExists(
      email,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY EXISTS BY GST
   * -------------------------------------------------------
   */

  async existsByGST(
    gstNumber: string,
  ): Promise<boolean> {
    return this.repository.gstExists(
      gstNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY EXISTS BY PAN
   * -------------------------------------------------------
   */

  async existsByPAN(
    panNumber: string,
  ): Promise<boolean> {
    return this.repository.panExists(
      panNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPANY EXISTS BY CODE
   * -------------------------------------------------------
   */

  async existsByCompanyCode(
    companyCode: string,
  ): Promise<boolean> {
    return this.repository.isDuplicate(
      companyCode,
    );
  }

  /**
   * -------------------------------------------------------
   * VALIDATE COMPANY
   * -------------------------------------------------------
   */

  async validateCompany(
    id: string,
  ): Promise<Company> {
    return this.repository.findById(id);
  }

  /**
   * -------------------------------------------------------
   * ADMIN OVERVIEW
   * -------------------------------------------------------
   */

  async adminOverview() {
    const [
      total,
      active,
      suspended,
      trial,
      enterprise,
      recent,
    ] = await Promise.all([
      this.repository.totalCompanies(),
      this.repository.activeCompanies(),
      this.repository.suspendedCompanies(),
      this.repository.trialCompanies(),
      this.repository.enterpriseCompanies(),
      this.repository.recentCompanies(10),
    ]);

    return {
      totalCompanies: total,
      activeCompanies: active,
      suspendedCompanies: suspended,
      trialCompanies: trial,
      enterpriseCompanies: enterprise,
      recentCompanies: recent,
    };
  }
    /**
   * -------------------------------------------------------
   * UPSERT COMPANY
   * -------------------------------------------------------
   */

  async upsert(
    where: Parameters<
      CompanyRepository['upsert']
    >[0],
    create: Parameters<
      CompanyRepository['upsert']
    >[1],
    update: Parameters<
      CompanyRepository['upsert']
    >[2],
  ): Promise<Company> {
    return this.repository.upsert(
      where,
      create,
      update,
    );
  }

  /**
   * -------------------------------------------------------
   * CREATE MANY
   * -------------------------------------------------------
   */

  async createMany(
    data: Parameters<
      CompanyRepository['createMany']
    >[0],
  ) {
    if (!data.length) {
      throw new BadRequestException(
        'No company records supplied.',
      );
    }

    return this.repository.createMany(
      data,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE MANY
   * -------------------------------------------------------
   */

  async updateMany(
    where: Parameters<
      CompanyRepository['updateMany']
    >[0],
    data: Parameters<
      CompanyRepository['updateMany']
    >[1],
  ) {
    return this.repository.updateMany(
      where,
      data,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE MANY
   * -------------------------------------------------------
   */

  async deleteMany(
    where: Parameters<
      CompanyRepository['deleteMany']
    >[0],
  ) {
    return this.repository.deleteMany(
      where,
    );
  }

  /**
   * -------------------------------------------------------
   * SERVICE INFORMATION
   * -------------------------------------------------------
   */

  getServiceInfo() {
    return {
      module: 'Companies',
      service: CompanyService.name,
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date(),
    };
  }

  /**
   * -------------------------------------------------------
   * SERVICE READY
   * -------------------------------------------------------
   */

  isReady(): boolean {
    return true;
  }
}