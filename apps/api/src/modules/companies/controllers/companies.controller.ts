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

// Using 'import type' prevents the NestJS compiler crash while satisfying ESLint
import type {
  SubscriptionDetails,
  CompanySettings,
} from '../types/company.types';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Get()
  async findAll(@Query() query: CompanyQueryDto) {
    return this.companyService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return this.companyService.restore(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.companyService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.companyService.deactivate(id);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.companyService.suspend(id, reason);
  }

  @Patch(':id/block')
  block(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.companyService.block(id, reason);
  }

  @Patch(':id/subscription')
  updateSubscription(
    @Param('id') id: string,
    @Body() subscription: Record<string, unknown>,
  ) {
    return this.companyService.updateSubscription(
      id,
      subscription as unknown as SubscriptionDetails,
    );
  }

  @Patch(':id/settings')
  updateSettings(
    @Param('id') id: string,
    @Body() settings: Record<string, unknown>,
  ) {
    return this.companyService.updateSettings(
      id,
      settings as unknown as CompanySettings,
    );
  }

  @Patch(':id/storage/increase')
  increaseStorage(@Param('id') id: string, @Body('gb') gb: number) {
    return this.companyService.increaseStorage(id, gb);
  }

  @Patch(':id/storage/decrease')
  decreaseStorage(@Param('id') id: string, @Body('gb') gb: number) {
    return this.companyService.decreaseStorage(id, gb);
  }

  @Get(':id/dashboard')
  dashboard(@Param('id') id: string) {
    return this.companyService.getDashboard(id);
  }

  @Get(':id/statistics')
  statistics(@Param('id') id: string) {
    return this.companyService.getStatistics(id);
  }

  @Get(':id/overview')
  overview(@Param('id') id: string) {
    return this.companyService.companyOverview(id);
  }

  @Get(':id/health')
  health(@Param('id') id: string) {
    return this.companyService.companyHealth(id);
  }

  @Get('country/:country')
  byCountry(@Param('country') country: string) {
    return this.companyService.findByCountry(country);
  }

  @Get('state/:state')
  byState(@Param('state') state: string) {
    return this.companyService.findByState(state);
  }

  @Get('city/:city')
  byCity(@Param('city') city: string) {
    return this.companyService.findByCity(city);
  }

  @Get('status/:status')
  byStatus(@Param('status') status: string) {
    return this.companyService.companiesByStatus(status);
  }

  @Get('plan/:plan')
  byPlan(@Param('plan') plan: string) {
    return this.companyService.companiesByPlan(plan);
  }

  @Post('bulk/activate')
  bulkActivate(@Body('ids') ids: string[]) {
    return this.companyService.bulkActivate(ids);
  }

  @Post('bulk/deactivate')
  bulkDeactivate(@Body('ids') ids: string[]) {
    return this.companyService.bulkDeactivate(ids);
  }

  @Post('bulk/suspend')
  bulkSuspend(@Body('ids') ids: string[], @Body('reason') reason?: string) {
    return this.companyService.bulkSuspend(ids, reason);
  }

  @Post('bulk/delete')
  bulkDelete(@Body('ids') ids: string[]) {
    return this.companyService.bulkRemove(ids);
  }

  @Post('bulk/restore')
  bulkRestore(@Body('ids') ids: string[]) {
    return this.companyService.bulkRestore(ids);
  }

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

  @Get('system/health')
  healthCheck() {
    return this.companyService.healthCheck();
  }

  @Get('system/ping')
  ping() {
    return this.companyService.ping();
  }
}
