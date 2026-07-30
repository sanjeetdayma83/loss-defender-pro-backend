import { CreateReportDto } from '../dto/create-report.dto';
import { ReportQueryDto } from '../dto/report-query.dto';

export interface IReportsService {
  dashboard(
    query: ReportQueryDto,
  ): Promise<any>;

  warehouse(
    query: ReportQueryDto,
  ): Promise<any>;

  scanner(
    query: ReportQueryDto,
  ): Promise<any>;

  users(
    query: ReportQueryDto,
  ): Promise<any>;

  claims(
    query: ReportQueryDto,
  ): Promise<any>;

  returns(
    query: ReportQueryDto,
  ): Promise<any>;

  create(
    dto: CreateReportDto,
  ): Promise<any>;

  healthCheck(): Promise<boolean>;
}