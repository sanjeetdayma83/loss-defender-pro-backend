import { Injectable } from '@nestjs/common';

import { ReportsRepository } from '../repositories/reports.repository';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';
import { IReportsService } from '../interfaces/reports.interface';

@Injectable()
export class ReportsService implements IReportsService {
  constructor(
    private readonly repository: ReportsRepository,
  ) {}

  async dashboard(query: ReportQueryDto) {
    return this.repository.dashboard(query);
  }

  async warehouse(query: ReportQueryDto) {
    return this.repository.warehouse(query);
  }

  async scanner(query: ReportQueryDto) {
    return this.repository.scanner(query);
  }

  async users(query: ReportQueryDto) {
    return this.repository.users(query);
  }

  async claims(query: ReportQueryDto) {
    return this.repository.claims(query);
  }

  async returns(query: ReportQueryDto) {
    return this.repository.returns(query);
  }

  async create(dto: CreateReportDto) {
    return this.repository.create(dto);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findAll(page = 1, limit = 20) {
    return this.repository.findAll(page, limit);
  }

  async update(id: string, dto: UpdateReportDto) {
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    return this.repository.delete(id);
  }

  async getKPI(query: ReportQueryDto) {
    return this.repository.getKPI(query);
  }

  async exportJSON(query: ReportQueryDto) {
    return this.repository.exportJSON(query);
  }

  async exportCSV(query: ReportQueryDto) {
    return this.repository.exportCSV(query);
  }

  async exportExcel(query: ReportQueryDto) {
    return this.repository.exportExcel(query);
  }

  async exportPDF(query: ReportQueryDto) {
    return this.repository.exportPDF(query);
  }

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  async ping() {
    return this.repository.ping();
  }

  count() {
    return this.repository.count();
  }

  async getRepository() {
    return this.repository;
  }

  async metadata() {
    return {
      module: 'Reports',
      service: 'ReportsService',
      version: '1.0.0',
      healthy: await this.healthCheck(),
      timestamp: new Date(),
    };
  }
}