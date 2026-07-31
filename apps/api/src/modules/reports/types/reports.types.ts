export interface ReportDateRange {
  from: Date;
  to: Date;
}

export interface ReportSummary {
  totalOrders: number;
  totalScans: number;
  totalClaims: number;
  totalReturns: number;
}

export interface KPIStatistics {
  scanAccuracy: number;
  claimRate: number;
  returnRate: number;
  productivity: number;
}

export interface ReportFilter {
  companyId?: string;
  warehouseId?: string;
  userId?: string;
  reportType?: string;
  from?: Date;
  to?: Date;
}
