import { Company } from '@prisma/client';

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

export interface ICompanyService {
  /**
   * -------------------------------------------------------
   * CRUD
   * -------------------------------------------------------
   */

  create(
    dto: CreateCompanyDto,
  ): Promise<Company>;

  update(
    id: string,
    dto: UpdateCompanyDto,
  ): Promise<Company>;

  remove(
    id: string,
  ): Promise<Company>;

  restore(
    id: string,
  ): Promise<Company>;

  findById(
    id: string,
  ): Promise<Company>;

  findAll(
    query: CompanyQueryDto,
  ): Promise<
    CompanySearchResult<Company>
  >;

  /**
   * -------------------------------------------------------
   * LOOKUPS
   * -------------------------------------------------------
   */

  findByEmail(
    email: string,
  ): Promise<Company | null>;

  findByGST(
    gstNumber: string,
  ): Promise<Company | null>;

  findByPAN(
    panNumber: string,
  ): Promise<Company | null>;

  exists(
    id: string,
  ): Promise<boolean>;

  /**
   * -------------------------------------------------------
   * STATUS
   * -------------------------------------------------------
   */

  activate(
    id: string,
  ): Promise<Company>;

  deactivate(
    id: string,
  ): Promise<Company>;

  suspend(
    id: string,
    reason?: string,
  ): Promise<Company>;

  block(
    id: string,
    reason?: string,
  ): Promise<Company>;

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION
   * -------------------------------------------------------
   */

  updateSubscription(
    id: string,
    subscription: SubscriptionDetails,
  ): Promise<Company>;

  /**
   * -------------------------------------------------------
   * SETTINGS
   * -------------------------------------------------------
   */

  updateSettings(
    id: string,
    settings: CompanySettings,
  ): Promise<Company>;

  /**
   * -------------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------------
   */

  getStatistics(
    id: string,
  ): Promise<CompanyStatistics>;

  getDashboard(
    id: string,
  ): Promise<CompanyDashboardSummary>;

  /**
   * -------------------------------------------------------
   * STORAGE
   * -------------------------------------------------------
   */

  increaseStorage(
    id: string,
    gb: number,
  ): Promise<Company>;

  decreaseStorage(
    id: string,
    gb: number,
  ): Promise<Company>;

  /**
   * -------------------------------------------------------
   * ANALYTICS
   * -------------------------------------------------------
   */

  totalCompanies(): Promise<number>;

  activeCompanies(): Promise<number>;

  suspendedCompanies(): Promise<number>;

  trialCompanies(): Promise<number>;

  enterpriseCompanies(): Promise<number>;

  /**
   * -------------------------------------------------------
   * UTILITIES
   * -------------------------------------------------------
   */

  healthCheck(): Promise<boolean>;

  ping(): Promise<boolean>;
}