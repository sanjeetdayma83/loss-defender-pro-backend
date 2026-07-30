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

import { ScannerService } from '../services/scanner.service';

import { CreateScannerDto } from '../dto/create-scanner.dto';
import { UpdateScannerDto } from '../dto/update-scanner.dto';
import { ScannerQueryDto } from '../dto/scanner-query.dto';

@Controller('scanner')
export class ScannerController {
  constructor(
    private readonly service: ScannerService,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  @Post()
  create(
    @Body()
    dto: CreateScannerDto,
  ) {
    return this.service.create(dto);
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  @Get()
  findAll(
    @Query()
    query: ScannerQueryDto,
  ) {
    return this.service.findAll(query);
  }

  /**
   * -------------------------------------------------------
   * FIND ONE
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
   * BARCODE
   * -------------------------------------------------------
   */

  @Get('barcode/:barcode')
  findByBarcode(
    @Param('barcode')
    barcode: string,
  ) {
    return this.service.findByBarcode(
      barcode,
    );
  }

  /**
   * -------------------------------------------------------
   * ORDER
   * -------------------------------------------------------
   */

  @Get('order/:orderId')
  findByOrder(
    @Param('orderId')
    orderId: string,
  ) {
    return this.service.findByOrder(
      orderId,
    );
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE
   * -------------------------------------------------------
   */

  @Get('warehouse/:warehouseId')
  findByWarehouse(
    @Param('warehouseId')
    warehouseId: string,
  ) {
    return this.service.findByWarehouse(
      warehouseId,
    );
  }

  /**
   * -------------------------------------------------------
   * SESSION
   * -------------------------------------------------------
   */

  @Get('session/:sessionId')
  findBySession(
    @Param('sessionId')
    sessionId: string,
  ) {
    return this.service.findBySession(
      sessionId,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  @Patch(':id')
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateScannerDto,
  ) {
    return this.service.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE
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
   * RESTORE
   * -------------------------------------------------------
   */

  @Patch(':id/restore')
  restore(
    @Param('id')
    id: string,
  ) {
    return this.service.restore(id);
  }
    /**
   * -------------------------------------------------------
   * VERIFY SCAN
   * -------------------------------------------------------
   */

  @Patch(':id/verify')
  verifyScan(
    @Param('id')
    id: string,

    @Body('verifiedBy')
    verifiedBy: string,
  ) {
    return this.service.verifyScan(
      id,
      verifiedBy,
    );
  }

  /**
   * -------------------------------------------------------
   * MARK FAILED
   * -------------------------------------------------------
   */

  @Patch(':id/fail')
  markFailed(
    @Param('id')
    id: string,

    @Body('remarks')
    remarks?: string,
  ) {
    return this.service.markFailed(
      id,
      remarks,
    );
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE CHECK
   * -------------------------------------------------------
   */

  @Get('duplicate/:orderId/:barcode')
  isDuplicate(
    @Param('orderId')
    orderId: string,

    @Param('barcode')
    barcode: string,
  ) {
    return this.service.isDuplicateScan(
      barcode,
      orderId,
    );
  }

  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  @Get('statistics')
  statistics() {
    return this.service.getStatistics();
  }

  @Get('statistics/session/:sessionId')
  sessionStatistics(
    @Param('sessionId')
    sessionId: string,
  ) {
    return this.service.getSessionStatistics(
      sessionId,
    );
  }

  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  @Post('bulk/verify')
  bulkVerify(
    @Body('ids')
    ids: string[],

    @Body('verifiedBy')
    verifiedBy: string,
  ) {
    return this.service.bulkVerify(
      ids,
      verifiedBy,
    );
  }

  @Post('bulk/delete')
  bulkDelete(
    @Body('ids')
    ids: string[],
  ) {
    return this.service.bulkDelete(ids);
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

  @Get('metadata')
  metadata() {
    return this.service.metadata();
  }
}