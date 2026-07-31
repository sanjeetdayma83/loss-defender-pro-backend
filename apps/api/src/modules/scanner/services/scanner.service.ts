import { ConflictException, Injectable } from '@nestjs/common';

import { Scanner } from '@prisma/client';

import { ScannerRepository } from '../repositories/scanner.repository';

import { CreateScannerDto } from '../dto/create-scanner.dto';
import { UpdateScannerDto } from '../dto/update-scanner.dto';
import { ScannerQueryDto } from '../dto/scanner-query.dto';

import { IScannerService } from '../interfaces/scanner.interface';

@Injectable()
export class ScannerService implements IScannerService {
  constructor(private readonly repository: ScannerRepository) {}

  /**
   * -------------------------------------------------------
   * CREATE SCAN
   * -------------------------------------------------------
   */

  async create(dto: CreateScannerDto): Promise<Scanner> {
    const duplicate = await this.repository.isDuplicateScan(
      dto.barcode,
      dto.orderId,
    );

    if (duplicate) {
      throw new ConflictException('Duplicate barcode scan detected.');
    }

    return this.repository.create(dto);
  }

  /**
   * -------------------------------------------------------
   * READ
   * -------------------------------------------------------
   */

  async findAll(query: ScannerQueryDto) {
    return this.repository.findAll(query);
  }

  async findById(id: string): Promise<Scanner> {
    return this.repository.findById(id);
  }

  async findByBarcode(barcode: string) {
    return this.repository.findByBarcode(barcode);
  }

  async findByOrder(orderId: string) {
    return this.repository.findByOrder(orderId);
  }

  async findByWarehouse(warehouseId: string) {
    return this.repository.findByWarehouse(warehouseId);
  }

  async findBySession(sessionId: string) {
    return this.repository.findBySession(sessionId);
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(id: string, dto: UpdateScannerDto): Promise<Scanner> {
    return this.repository.update(id, dto);
  }

  /**
   * -------------------------------------------------------
   * DELETE
   * -------------------------------------------------------
   */

  async remove(id: string): Promise<Scanner> {
    return this.repository.softDelete(id);
  }

  async restore(id: string): Promise<Scanner> {
    return this.repository.restore(id);
  }

  /**
   * -------------------------------------------------------
   * VERIFICATION
   * -------------------------------------------------------
   */

  async verifyScan(id: string, verifiedBy: string) {
    return this.repository.verifyScan(id, verifiedBy);
  }

  async markFailed(id: string, remarks?: string) {
    return this.repository.markFailed(id, remarks);
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE CHECK
   * -------------------------------------------------------
   */

  async isDuplicateScan(barcode: string, orderId: string) {
    return this.repository.isDuplicateScan(barcode, orderId);
  }

  async barcodeExists(barcode: string) {
    return this.repository.barcodeExists(barcode);
  }

  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics() {
    return this.repository.getStatistics();
  }

  async getSessionStatistics(sessionId: string) {
    return this.repository.getSessionStatistics(sessionId);
  }
  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkVerify(ids: string[], verifiedBy: string) {
    return this.repository.bulkVerify(ids, verifiedBy);
  }

  async bulkDelete(ids: string[]) {
    return this.repository.bulkDelete(ids);
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  ping() {
    return this.repository.ping();
  }

  /**
   * -------------------------------------------------------
   * GENERIC HELPERS
   * -------------------------------------------------------
   */

  count() {
    return this.repository.count();
  }

  getRepository(): Promise<ScannerRepository> {
    return Promise.resolve(this.repository);
  }

  async metadata() {
    return {
      module: 'Scanner',
      service: 'ScannerService',
      version: '1.0.0',
      healthy: await this.healthCheck(),
      timestamp: new Date(),
    };
  }
}
