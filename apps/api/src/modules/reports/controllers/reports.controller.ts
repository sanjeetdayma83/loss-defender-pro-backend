import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

import { ReportsService } from '../services/reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.WAREHOUSE_MANAGER,
  UserRole.SUPERVISOR,
)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('dashboard')
  dashboard(@Query() query: ReportQueryDto) {
    return this.service.dashboard(query);
  }

  @Get('warehouse')
  warehouse(@Query() query: ReportQueryDto) {
    return this.service.warehouse(query);
  }

  @Get('scanner')
  scanner(@Query() query: ReportQueryDto) {
    return this.service.scanner(query);
  }

  @Get('users')
  users(@Query() query: ReportQueryDto) {
    return this.service.users(query);
  }

  @Get('claims')
  claims(@Query() query: ReportQueryDto) {
    return this.service.claims(query);
  }

  @Get('returns')
  returns(@Query() query: ReportQueryDto) {
    return this.service.returns(query);
  }

  @Get('kpi')
  getKPI(@Query() query: ReportQueryDto) {
    return this.service.getKPI(query);
  }

  @Get('export/json')
  exportJSON(@Query() query: ReportQueryDto) {
    return this.service.exportJSON(query);
  }

  @Get('export/csv')
  exportCSV(@Query() query: ReportQueryDto) {
    return this.service.exportCSV(query);
  }

  @Get('export/excel')
  exportExcel(@Query() query: ReportQueryDto) {
    return this.service.exportExcel(query);
  }

  @Get('export/pdf')
  exportPDF(@Query() query: ReportQueryDto) {
    return this.service.exportPDF(query);
  }

  @Get('health/check')
  healthCheck() {
    return this.service.healthCheck();
  }

  @Get('health/ping')
  ping() {
    return this.service.ping();
  }

  @Get('metadata')
  metadata() {
    return this.service.metadata();
  }

  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

