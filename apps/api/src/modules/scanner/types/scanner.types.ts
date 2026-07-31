export interface ScanLocation {
  warehouseId: string;
  zoneId?: string;
  rackId?: string;
  binId?: string;
}

export interface ScanDevice {
  id: string;
  name: string;
  type: string;
  platform: string;
}

export interface ScanResult {
  barcode: string;
  barcodeType: string;
  status: string;
  duplicate: boolean;
  message?: string;
}

export interface ScanStatistics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  duplicateScans: number;
}

export interface ScannerFilter {
  search?: string;
  orderId?: string;
  warehouseId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
