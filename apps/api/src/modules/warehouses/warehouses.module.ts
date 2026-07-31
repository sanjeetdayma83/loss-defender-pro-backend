import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { WarehousesController } from './controllers/warehouses.controller';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseService } from './services/warehouse.service';

@Module({
  controllers: [WarehousesController],
  providers: [PrismaService, WarehouseRepository, WarehouseService],
  exports: [WarehouseRepository, WarehouseService],
})
export class WarehousesModule {}
