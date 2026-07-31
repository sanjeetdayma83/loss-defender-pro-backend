import type {
  KPIStatistics,
  ReportDateRange,
  ReportSummary,
} from '../types/reports.types';

export class ReportEntity {
  id: string;
  companyId: string;
  warehouseId?: string;
  reportType: string;
  reportName: string;
  description?: string;
  dateRange: ReportDateRange;
  summary: ReportSummary;
  kpi: KPIStatistics;
  generatedBy: string;
  exportFormat: string;
  downloadUrl?: string;
  isScheduled: boolean;
  scheduleCron?: string;
  createdAt: Date;
  updatedAt: Date;
}