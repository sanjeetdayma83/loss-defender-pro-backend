import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { OrdersController } from './controllers/orders.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { OrderStateMachine } from './utils/order-state-machine';

@Module({
  controllers: [OrdersController],
  providers: [PrismaService, OrderRepository, OrderService, OrderStateMachine],
  exports: [OrderRepository, OrderService, OrderStateMachine],
})
export class OrdersModule {}
