import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { AlertsController } from './controllers/alerts.controller';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [AlertsController],
})
export class AlertsModule {}
