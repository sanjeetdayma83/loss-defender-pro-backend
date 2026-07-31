import {
  ScanDevice,
  ScanLocation,
  ScanResult,
  ScanStatistics,
} from '../types/scanner.types';

export class ScannerResponseDto {
  id: string;

  companyId: string;

  warehouseId: string;

  orderId: string;

  sessionId: string;

  barcode: string;

  barcodeType: string;

  status: string;

  location: ScanLocation;

  device: ScanDevice;

  result: ScanResult;

  statistics: ScanStatistics;

  evidenceId?: string;

  scannedBy: string;

  verifiedBy?: string;

  scannedAt: Date;

  verifiedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}
