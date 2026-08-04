import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';

import { OrdersController } from './controllers/orders.controller';
import { OrderRepository } from './repositories/order.repository';
import { OrderService } from './services/order.service';
import { OrderStateMachine } from './utils/order-state-machine';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController],
  providers: [PrismaService, OrderRepository, OrderService, OrderStateMachine],
  exports: [OrderRepository, OrderService, OrderStateMachine],
})
export class OrdersModule {}

