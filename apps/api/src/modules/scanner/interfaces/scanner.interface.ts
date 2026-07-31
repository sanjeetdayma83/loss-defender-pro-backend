import { Scanner } from '@prisma/client';

import { CreateScannerDto } from '../dto/create-scanner.dto';
import { UpdateScannerDto } from '../dto/update-scanner.dto';
import { ScannerQueryDto } from '../dto/scanner-query.dto';

export interface IScannerService {
  create(dto: CreateScannerDto): Promise<Scanner>;

  update(id: string, dto: UpdateScannerDto): Promise<Scanner>;

  remove(id: string): Promise<Scanner>;

  restore(id: string): Promise<Scanner>;

  findById(id: string): Promise<Scanner>;

  findAll(query: ScannerQueryDto): Promise<any>;

  healthCheck(): Promise<boolean>;
}
