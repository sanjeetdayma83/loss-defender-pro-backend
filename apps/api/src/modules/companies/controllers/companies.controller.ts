import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CompanyService } from '../services/company.service';

import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyQueryDto } from '../dto/company-query.dto';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companyService: CompanyService,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE COMPANY
   * -------------------------------------------------------
   */

  @Post()
  async create(
    @Body()
    dto: CreateCompanyDto,
  ) {
    return this.companyService.create(
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * GET ALL COMPANIES
   * -------------------------------------------------------
   */

  @Get()
  async findAll(
    @Query()
    query: CompanyQueryDto,
  ) {
    return this.companyService.findAll(
      query,
    );
  }

  /**
   * -------------------------------------------------------
   * GET COMPANY BY ID
   * -------------------------------------------------------
   */

  @Get(':id')
  async findById(
    @Param('id')
    id: string,
  ) {
    return this.companyService.findById(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE COMPANY
   * -------------------------------------------------------
   */

  @Patch(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * SOFT DELETE COMPANY
   * -------------------------------------------------------
   */

  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return this.companyService.remove(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * RESTORE COMPANY
   * -------------------------------------------------------
   */

  @Patch(':id/restore')
  async restore(
    @Param('id')
    id: string,
  ) {
    return this.companyService.restore(
      id,
    );
  }
    /**
   * -------------------------------------------------------
   * COMPANY LIFECYCLE
   * -------------------------------------------------------
   */

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.companyService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.companyService.deactivate(id);
  }

  @Patch(':id/suspend')
  suspend(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.companyService.suspend(
      id,
      reason,
    );
  }

  @Patch(':id/block')
  block(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.companyService.block(
      id,
      reason,
    );
  }

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION / SETTINGS
   * -------------------------------------------------------
   */

  @Patch(':id/subscription')
  updateSubscription(
    @Param('id') id: string,
    @Body() subscription: any,
  ) {
    return this.companyService.updateSubscription(
      id,
      subscription,
    );
  }

  @Patch(':id/settings')
  updateSettings(
    @Param('id') id: string,
    @Body() settings: any,
  ) {
    return this.companyService.updateSettings(
      id,
      settings,
    );
  }

  /**
   * -------------------------------------------------------
   * STORAGE
   * -------------------------------------------------------
   */

  @Patch(':id/storage/increase')
  increaseStorage(
    @Param('id') id: string,
    @Body('gb') gb: number,
  ) {
    return this.companyService.increaseStorage(
      id,
      gb,
    );
  }

  @Patch(':id/storage/decrease')
  decreaseStorage(
    @Param('id') id: string,
    @Body('gb') gb: number,
  ) {
    return this.companyService.decreaseStorage(
      id,
      gb,
    );
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------------
   */

  @Get(':id/dashboard')
  dashboard(
    @Param('id') id: string,
  ) {
    return this.companyService.getDashboard(
      id,
    );
  }

  @Get(':id/statistics')
  statistics(
    @Param('id') id: string,
  ) {
    return this.companyService.getStatistics(
      id,
    );
  }

  @Get(':id/overview')
  overview(
    @Param('id') id: string,
  ) {
    return this.companyService.companyOverview(
      id,
    );
  }

  @Get(':id/health')
  health(
    @Param('id') id: string,
  ) {
    return this.companyService.companyHealth(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------
   */

  @Get('country/:country')
  byCountry(
    @Param('country') country: string,
  ) {
    return this.companyService.findByCountry(
      country,
    );
  }

  @Get('state/:state')
  byState(
    @Param('state') state: string,
  ) {
    return this.companyService.findByState(
      state,
    );
  }

  @Get('city/:city')
  byCity(
    @Param('city') city: string,
  ) {
    return this.companyService.findByCity(
      city,
    );
  }

  @Get('status/:status')
  byStatus(
    @Param('status') status: string,
  ) {
    return this.companyService.companiesByStatus(
      status,
    );
  }

  @Get('plan/:plan')
  byPlan(
    @Param('plan') plan: string,
  ) {
    return this.companyService.companiesByPlan(
      plan,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  @Post('bulk/activate')
  bulkActivate(
    @Body('ids') ids: string[],
  ) {
    return this.companyService.bulkActivate(
      ids,
    );
  }

  @Post('bulk/deactivate')
  bulkDeactivate(
    @Body('ids') ids: string[],
  ) {
    return this.companyService.bulkDeactivate(
      ids,
    );
  }

  @Post('bulk/suspend')
  bulkSuspend(
    @Body('ids') ids: string[],
    @Body('reason') reason?: string,
  ) {
    return this.companyService.bulkSuspend(
      ids,
      reason,
    );
  }

  @Post('bulk/delete')
  bulkDelete(
    @Body('ids') ids: string[],
  ) {
    return this.companyService.bulkRemove(
      ids,
    );
  }

  @Post('bulk/restore')
  bulkRestore(
    @Body('ids') ids: string[],
  ) {
    return this.companyService.bulkRestore(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * ANALYTICS
   * -------------------------------------------------------
   */

  @Get('analytics/admin')
  adminOverview() {
    return this.companyService.adminOverview();
  }

  @Get('analytics/recent')
  recent() {
    return this.companyService.recentCompanies();
  }

  @Get('analytics/trial')
  trial() {
    return this.companyService.trialCompanies();
  }

  @Get('analytics/enterprise')
  enterprise() {
    return this.companyService.enterpriseCompanies();
  }

  @Get('analytics/storage')
  storage() {
    return this.companyService.companiesNearStorageLimit();
  }

  /**
   * -------------------------------------------------------
   * SYSTEM
   * -------------------------------------------------------
   */

  @Get('system/health')
  healthCheck() {
    return this.companyService.healthCheck();
  }

  @Get('system/ping')
  ping() {
    return this.companyService.ping();
  }
}