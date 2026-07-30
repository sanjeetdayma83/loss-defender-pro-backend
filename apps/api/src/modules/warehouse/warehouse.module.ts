import { Module } from '@nestjs/common';

import { WarehouseController } from './controllers/warehouse.controller';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseService } from './services/warehouse.service';

@Module({
  controllers: [WarehouseController],
  providers: [
    WarehouseRepository,
    WarehouseService,
  ],
  exports: [
    WarehouseService,
    WarehouseRepository,
  ],
})
export class WarehouseModule {}