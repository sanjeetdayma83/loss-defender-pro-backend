import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { ReturnsController } from './controllers/returns.controller';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [ReturnsController],
})
export class ReturnsModule {}
