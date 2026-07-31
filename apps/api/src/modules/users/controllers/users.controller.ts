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

import { UserService } from '../services/user.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UserService) {}

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  @Post()
  create(
    @Body()
    dto: CreateUserDto,
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
    query: UserQueryDto,
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
   * COMPANY USERS
   * -------------------------------------------------------
   */

  @Get('company/:companyId')
  findByCompany(
    @Param('companyId')
    companyId: string,
  ) {
    return this.service.findByCompany(companyId);
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE USERS
   * -------------------------------------------------------
   */

  @Get('warehouse/:warehouseId')
  findByWarehouse(
    @Param('warehouseId')
    warehouseId: string,
  ) {
    return this.service.findByWarehouse(warehouseId);
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
    dto: UpdateUserDto,
  ) {
    return this.service.update(id, dto);
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
   * ACTIVATE
   * -------------------------------------------------------
   */

  @Patch(':id/activate')
  activate(
    @Param('id')
    id: string,
  ) {
    return this.service.activate(id);
  }

  /**
   * -------------------------------------------------------
   * DEACTIVATE
   * -------------------------------------------------------
   */

  @Patch(':id/deactivate')
  deactivate(
    @Param('id')
    id: string,
  ) {
    return this.service.deactivate(id);
  }
  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  @Get(':id/statistics')
  getStatistics(
    @Param('id')
    id: string,
  ) {
    return this.service.getStatistics(id);
  }

  /**
   * -------------------------------------------------------
   * PASSWORD
   * -------------------------------------------------------
   */

  @Patch(':id/password')
  updatePassword(
    @Param('id')
    id: string,

    @Body('password')
    password: string,
  ) {
    return this.service.updatePassword(id, password);
  }

  /**
   * -------------------------------------------------------
   * LAST LOGIN
   * -------------------------------------------------------
   */

  @Patch(':id/last-login')
  updateLastLogin(
    @Param('id')
    id: string,
  ) {
    return this.service.updateLastLogin(id);
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
    return this.service.bulkActivate(ids);
  }

  @Post('bulk/deactivate')
  bulkDeactivate(
    @Body('ids')
    ids: string[],
  ) {
    return this.service.bulkDeactivate(ids);
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
