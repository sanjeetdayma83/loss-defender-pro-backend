import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrderService } from '../../orders/services/order.service';

@ApiTags('Returns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('returns')
export class ReturnsController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll() {
    const items = await this.orderService.returnedOrders();
    return {
      items,
      total: items.length,
      message: 'Returns fetched successfully',
    };
  }

  @Get('summary')
  async summary() {
    const items = await this.orderService.returnedOrders();
    return {
      totalReturns: items.length,
      open: items.filter((o: any) => 
        o.status === 'RETURNED' || o.status === 'RETURN_REQUESTED'
      ).length,
      completed: items.filter((o: any) => 
        o.status === 'RETURN_COMPLETED'
      ).length,
    };
  }
}
