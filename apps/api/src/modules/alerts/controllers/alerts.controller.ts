import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OrderService } from '../../orders/services/order.service';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async findAll() {
    const [highPriority, returned, claimed] = await Promise.all([
      this.orderService.highPriorityOrders(),
      this.orderService.returnedOrders(),
      this.orderService.claimedOrders(),
    ]);

    const mapToAlert = (order: any, type: string, priority: string) => ({
      id: order.id,
      alert: type,
      desc: order.notes || order.exceptionReason || `${type} for order ${order.orderNumber || order.id}`,
      orderId: order.orderNumber || order.id,
      type,
      priority,
      time: order.updatedAt || order.createdAt,
      status: order.status === 'RESOLVED' ? 'Closed' : 'Open',
      user: order.assignedToName || order.operatorName || 'System',
      warehouse: order.warehouseName || order.warehouse?.name || '—',
      device: order.deviceId || '—',
      raw: order,
    });

    const alerts = [
      ...highPriority.map((o: any) => mapToAlert(o, 'High Priority Order', 'High')),
      ...returned.map((o: any) => mapToAlert(o, 'Return Requested', 'Medium')),
      ...claimed.map((o: any) => mapToAlert(o, 'Claim Raised', 'High')),
    ];

    alerts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return {
      items: alerts,
      total: alerts.length,
      open: alerts.filter((a) => a.status === 'Open').length,
    };
  }

  @Get('summary')
  async summary() {
    const data = await this.findAll();
    return {
      totalAlerts: data.total,
      openAlerts: data.open,
      highPriority: data.items.filter((a: any) => a.priority === 'High').length,
    };
  }
}
