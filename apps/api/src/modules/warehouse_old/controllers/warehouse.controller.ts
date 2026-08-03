import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WarehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../../auth/constants/permissions';

@ApiTags('Warehouses')
@ApiBearerAuth()
@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @ApiOperation({ summary: 'Create warehouse' })
  @Permissions(PERMISSIONS.WAREHOUSE_CREATE)
  create(
    @CurrentUser() user: { companyId: string },
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehouseService.create(user.companyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @Permissions(PERMISSIONS.WAREHOUSE_VIEW)
  findAll(
    @CurrentUser() user: { companyId: string },
    @Query() query: WarehouseQueryDto,
  ) {
    return this.warehouseService.findAll(user.companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by id' })
  @Permissions(PERMISSIONS.WAREHOUSE_VIEW)
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse' })
  @Permissions(PERMISSIONS.WAREHOUSE_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete warehouse' })
  @Permissions(PERMISSIONS.WAREHOUSE_DELETE)
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}
