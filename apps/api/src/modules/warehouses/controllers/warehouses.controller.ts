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

import { WarehouseService } from '../services/warehouse.service';

import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehouseService: WarehouseService) {}

  /**
   * -------------------------------------------------------
   * CRUD
   * -------------------------------------------------------
   */

  @Post()
  create(
    @Body()
    dto: CreateWarehouseDto,
  ) {
    return this.warehouseService.create(dto);
  }

  @Get()
  findAll(
    @Query()
    query: WarehouseQueryDto,
  ) {
    return this.warehouseService.findAll(query);
  }

  @Get(':id')
  findById(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateWarehouseDto,
  ) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.remove(id);
  }

  @Patch(':id/restore')
  restore(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.restore(id);
  }

  /**
   * -------------------------------------------------------
   * STATUS
   * -------------------------------------------------------
   */

  @Patch(':id/activate')
  activate(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.activate(id);
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.deactivate(id);
  }

  /**
   * -------------------------------------------------------
   * CAPACITY
   * -------------------------------------------------------
   */

  @Patch(':id/capacity')
  updateCapacity(
    @Param('id')
    id: string,
    @Body('capacity')
    capacity: Record<string, unknown>,
  ) {
    return this.warehouseService.updateCapacity(id, capacity);
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD
   * -------------------------------------------------------
   */

  @Get(':id/dashboard')
  dashboard(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.getDashboard(id);
  }

  @Get(':id/statistics')
  statistics(
    @Param('id')
    id: string,
  ) {
    return this.warehouseService.getStatistics(id);
  }

  /**
   * -------------------------------------------------------
   * SEARCH
   * -------------------------------------------------------
   */

  @Get('company/:companyId')
  byCompany(
    @Param('companyId')
    companyId: string,
  ) {
    return this.warehouseService.findByCompany(companyId);
  }

  @Get('code/:code')
  byCode(
    @Param('code')
    code: string,
  ) {
    return this.warehouseService.findByCode(code);
  }
  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  @Post('bulk/activate')
  bulkActivate(
    @Body('ids')
    ids: string[],
  ) {
    return this.warehouseService.bulkActivate(ids);
  }

  @Post('bulk/deactivate')
  bulkDeactivate(
    @Body('ids')
    ids: string[],
  ) {
    return this.warehouseService.bulkDeactivate(ids);
  }

  @Post('bulk/delete')
  bulkDelete(
    @Body('ids')
    ids: string[],
  ) {
    return this.warehouseService.bulkDelete(ids);
  }

  /**
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   */

  @Get('exists/:warehouseCode')
  existsByCode(
    @Param('warehouseCode')
    warehouseCode: string,
  ) {
    return this.warehouseService.existsByCode(warehouseCode);
  }

  /**
   * -------------------------------------------------------
   * SYSTEM
   * -------------------------------------------------------
   */

  @Get('system/health')
  healthCheck() {
    return this.warehouseService.healthCheck();
  }

  @Get('system/ping')
  ping() {
    return this.warehouseService.ping();
  }

  @Get('system/info')
  serviceInfo() {
    return this.warehouseService.getServiceInfo();
  }
}
