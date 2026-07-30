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

import { ReportsService } from '../services/reports.service';

import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly service: ReportsService,
  ) {}

  /**
   * -------------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------------
   */

  @Get('dashboard')
  dashboard(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.dashboard(query);
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE REPORT
   * -------------------------------------------------------
   */

  @Get('warehouse')
  warehouse(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.warehouse(query);
  }

  /**
   * -------------------------------------------------------
   * SCANNER REPORT
   * -------------------------------------------------------
   */

  @Get('scanner')
  scanner(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.scanner(query);
  }

  /**
   * -------------------------------------------------------
   * USER PRODUCTIVITY
   * -------------------------------------------------------
   */

  @Get('users')
  users(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.users(query);
  }

  /**
   * -------------------------------------------------------
   * CLAIMS REPORT
   * -------------------------------------------------------
   */

  @Get('claims')
  claims(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.claims(query);
  }

  /**
   * -------------------------------------------------------
   * RETURNS REPORT
   * -------------------------------------------------------
   */

  @Get('returns')
  returns(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.returns(query);
  }

  /**
   * -------------------------------------------------------
   * CREATE REPORT
   * -------------------------------------------------------
   */

  @Post()
  create(
    @Body()
    dto: CreateReportDto,
  ) {
    return this.service.create(dto);
  }

  /**
   * -------------------------------------------------------
   * REPORT LIST
   * -------------------------------------------------------
   */

  @Get()
  findAll(
    @Query('page')
    page = 1,

    @Query('limit')
    limit = 20,
  ) {
    return this.service.findAll(
      Number(page),
      Number(limit),
    );
  }

  /**
   * -------------------------------------------------------
   * FIND REPORT
   * -------------------------------------------------------
   */

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.service.findById(id);
  }

  /**
   * -------------------------------------------------------
   * UPDATE REPORT
   * -------------------------------------------------------
   */

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateReportDto,
  ) {
    return this.service.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE REPORT
   * -------------------------------------------------------
   */

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.service.remove(id);
  }
    /**
   * -------------------------------------------------------
   * KPI
   * -------------------------------------------------------
   */

  @Get('kpi')
  getKPI(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.getKPI(query);
  }

  /**
   * -------------------------------------------------------
   * EXPORTS
   * -------------------------------------------------------
   */

  @Get('export/json')
  exportJSON(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.exportJSON(query);
  }

  @Get('export/csv')
  exportCSV(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.exportCSV(query);
  }

  @Get('export/excel')
  exportExcel(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.exportExcel(query);
  }

  @Get('export/pdf')
  exportPDF(
    @Query()
    query: ReportQueryDto,
  ) {
    return this.service.exportPDF(query);
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

  @Get('health/check')
  healthCheck() {
    return this.service.healthCheck();
  }

  @Get('health/ping')
  ping() {
    return this.service.ping();
  }

  /**
   * -------------------------------------------------------
   * METADATA
   * -------------------------------------------------------
   */

  @Get('metadata')
  metadata() {
    return this.service.metadata();
  }
}