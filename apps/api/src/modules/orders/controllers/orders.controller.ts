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

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Order } from '@prisma/client';

import { OrderService } from '../services/order.service';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE ORDER
   * -------------------------------------------------------
   */

  @Post()
  @ApiOperation({
    summary: 'Create new order',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
  })
  async create(
    @Body()
    dto: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.create(dto);
  }

  /**
   * -------------------------------------------------------
   * GET ALL ORDERS
   * -------------------------------------------------------
   */

  @Get()
  @ApiOperation({
    summary: 'Get paginated orders',
  })
  async findAll(
    @Query()
    query: OrderQueryDto,
  ) {
    return this.orderService.findAll(query);
  }

  /**
   * -------------------------------------------------------
   * GET ORDER
   * -------------------------------------------------------
   */

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by id',
  })
  async findOne(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.findById(id);
  }

  /**
   * -------------------------------------------------------
   * UPDATE ORDER
   * -------------------------------------------------------
   */

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order',
  })
  async update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE ORDER
   * -------------------------------------------------------
   */

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete order',
  })
  async remove(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.remove(id);
  }
    /**
   * -------------------------------------------------------
   * ASSIGN WAREHOUSE
   * -------------------------------------------------------
   */

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign warehouse and operator',
  })
  async assignWarehouse(
    @Param('id')
    id: string,

    @Body()
    body: {
      warehouseId: string;
      assignedTo: string;
    },
  ): Promise<Order> {
    return this.orderService.assignWarehouse(
      id,
      body.warehouseId,
      body.assignedTo,
    );
  }

  /**
   * -------------------------------------------------------
   * START PICKING
   * -------------------------------------------------------
   */

  @Post(':id/start-picking')
  @ApiOperation({
    summary: 'Start picking process',
  })
  async startPicking(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.startPicking(id);
  }

  /**
   * -------------------------------------------------------
   * START PACKING
   * -------------------------------------------------------
   */

  @Post(':id/start-packing')
  @ApiOperation({
    summary: 'Start packing process',
  })
  async startPacking(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.startPacking(id);
  }

  /**
   * -------------------------------------------------------
   * COMPLETE PACKING
   * -------------------------------------------------------
   */

  @Post(':id/complete-packing')
  @ApiOperation({
    summary: 'Complete packing process',
  })
  async completePacking(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.completePacking(id);
  }

  /**
   * -------------------------------------------------------
   * START RECORDING
   * -------------------------------------------------------
   */

  @Post(':id/start-recording')
  @ApiOperation({
    summary: 'Start warehouse recording',
  })
  async startRecording(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.startRecording(id);
  }

  /**
   * -------------------------------------------------------
   * COMPLETE RECORDING
   * -------------------------------------------------------
   */

  @Post(':id/complete-recording')
  @ApiOperation({
    summary: 'Complete warehouse recording',
  })
  async completeRecording(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.completeRecording(id);
  }
    /**
   * -------------------------------------------------------
   * START VERIFICATION
   * -------------------------------------------------------
   */

  @Post(':id/start-verification')
  @ApiOperation({
    summary: 'Start order verification',
  })
  async startVerification(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.startVerification(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPLETE VERIFICATION
   * -------------------------------------------------------
   */

  @Post(':id/complete-verification')
  @ApiOperation({
    summary: 'Complete order verification',
  })
  async completeVerification(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.completeVerification(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * READY TO SHIP
   * -------------------------------------------------------
   */

  @Post(':id/ready-to-ship')
  @ApiOperation({
    summary: 'Mark order as ready to ship',
  })
  async readyToShip(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.readyToShip(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * SHIP ORDER
   * -------------------------------------------------------
   */

  @Post(':id/ship')
  @ApiOperation({
    summary: 'Ship order',
  })
  async ship(
    @Param('id')
    id: string,

    @Body()
    body: {
      trackingNumber?: string;
    },
  ): Promise<Order> {
    return this.orderService.ship(
      id,
      body.trackingNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * DELIVER ORDER
   * -------------------------------------------------------
   */

  @Post(':id/deliver')
  @ApiOperation({
    summary: 'Mark order as delivered',
  })
  async deliver(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.deliver(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * CANCEL ORDER
   * -------------------------------------------------------
   */

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Cancel order',
  })
  async cancel(
    @Param('id')
    id: string,

    @Body()
    body: {
      reason?: string;
    },
  ): Promise<Order> {
    return this.orderService.cancel(
      id,
      body.reason,
    );
  }
    /**
   * -------------------------------------------------------
   * REOPEN ORDER
   * -------------------------------------------------------
   */

  @Post(':id/reopen')
  @ApiOperation({
    summary: 'Reopen cancelled order',
  })
  async reopen(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.reopen(id);
  }

  /**
   * -------------------------------------------------------
   * ARCHIVE ORDER
   * -------------------------------------------------------
   */

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archive order',
  })
  async archive(
    @Param('id')
    id: string,
  ): Promise<Order> {
    return this.orderService.archive(id);
  }

  /**
   * -------------------------------------------------------
   * ASSIGN OPERATOR
   * -------------------------------------------------------
   */

  @Post(':id/assign-operator')
  @ApiOperation({
    summary: 'Assign operator to order',
  })
  async assignOperator(
    @Param('id')
    id: string,

    @Body()
    body: {
      operatorId: string;
    },
  ): Promise<Order> {
    return this.orderService.assignOperator(
      id,
      body.operatorId,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE TRACKING
   * -------------------------------------------------------
   */

  @Post(':id/update-tracking')
  @ApiOperation({
    summary: 'Update tracking information',
  })
  async updateTracking(
    @Param('id')
    id: string,

    @Body()
    body: {
      trackingNumber: string;
      courier: string;
    },
  ): Promise<Order> {
    return this.orderService.updateTracking(
      id,
      body.trackingNumber,
      body.courier,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH RECORDING
   * -------------------------------------------------------
   */

  @Post(':id/attach-recording')
  @ApiOperation({
    summary: 'Attach recording to order',
  })
  async attachRecording(
    @Param('id')
    id: string,

    @Body()
    body: {
      recordingId: string;
    },
  ): Promise<Order> {
    return this.orderService.attachRecording(
      id,
      body.recordingId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH EVIDENCE
   * -------------------------------------------------------
   */

  @Post(':id/attach-evidence')
  @ApiOperation({
    summary: 'Attach evidence to order',
  })
  async attachEvidence(
    @Param('id')
    id: string,

    @Body()
    body: {
      evidenceId: string;
    },
  ): Promise<Order> {
    return this.orderService.attachEvidence(
      id,
      body.evidenceId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH CLAIM
   * -------------------------------------------------------
   */

  @Post(':id/attach-claim')
  @ApiOperation({
    summary: 'Attach claim to order',
  })
  async attachClaim(
    @Param('id')
    id: string,

    @Body()
    body: {
      claimId: string;
    },
  ): Promise<Order> {
    return this.orderService.attachClaim(
      id,
      body.claimId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH RETURN
   * -------------------------------------------------------
   */

  @Post(':id/attach-return')
  @ApiOperation({
    summary: 'Attach return to order',
  })
  async attachReturn(
    @Param('id')
    id: string,

    @Body()
    body: {
      returnId: string;
    },
  ): Promise<Order> {
    return this.orderService.attachReturn(
      id,
      body.returnId,
    );
  }
    /**
   * -------------------------------------------------------
   * ORDER STATISTICS
   * -------------------------------------------------------
   */

  @Get('statistics')
  @ApiOperation({
    summary: 'Get order statistics',
  })
  async statistics() {
    return this.orderService.getStatistics();
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD SUMMARY
   * -------------------------------------------------------
   */

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard summary',
  })
  async dashboard() {
    return this.orderService.getDashboardSummary();
  }

  /**
   * -------------------------------------------------------
   * RECENT ORDERS
   * -------------------------------------------------------
   */

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent orders',
  })
  async recentOrders(): Promise<Order[]> {
    return this.orderService.recentOrders();
  }

  /**
   * -------------------------------------------------------
   * HIGH PRIORITY ORDERS
   * -------------------------------------------------------
   */

  @Get('high-priority')
  @ApiOperation({
    summary: 'Get high priority orders',
  })
  async highPriorityOrders(): Promise<Order[]> {
    return this.orderService.highPriorityOrders();
  }

  /**
   * -------------------------------------------------------
   * UNASSIGNED ORDERS
   * -------------------------------------------------------
   */

  @Get('unassigned')
  @ApiOperation({
    summary: 'Get unassigned orders',
  })
  async unassignedOrders(): Promise<Order[]> {
    return this.orderService.unassignedOrders();
  }

  /**
   * -------------------------------------------------------
   * OVERDUE ORDERS
   * -------------------------------------------------------
   */

  @Get('overdue')
  @ApiOperation({
    summary: 'Get overdue orders',
  })
  async overdueOrders(): Promise<Order[]> {
    return this.orderService.overdueOrders();
  }

  /**
   * -------------------------------------------------------
   * PACKING QUEUE
   * -------------------------------------------------------
   */

  @Get('packing-queue')
  @ApiOperation({
    summary: 'Get packing queue',
  })
  async packingQueue(): Promise<Order[]> {
    return this.orderService.packingQueue();
  }

  /**
   * -------------------------------------------------------
   * VERIFICATION QUEUE
   * -------------------------------------------------------
   */

  @Get('verification-queue')
  @ApiOperation({
    summary: 'Get verification queue',
  })
  async verificationQueue(): Promise<Order[]> {
    return this.orderService.verificationQueue();
  }

  /**
   * -------------------------------------------------------
   * READY TO SHIP QUEUE
   * -------------------------------------------------------
   */

  @Get('ready-to-ship-queue')
  @ApiOperation({
    summary: 'Get ready to ship queue',
  })
  async readyToShipQueue(): Promise<Order[]> {
    return this.orderService.readyToShipQueue();
  }

  /**
   * -------------------------------------------------------
   * TODAY'S ORDERS
   * -------------------------------------------------------
   */

  @Get('today')
  @ApiOperation({
    summary: "Get today's orders",
  })
  async todayOrders(): Promise<Order[]> {
    return this.orderService.todayOrders();
  }

  /**
   * -------------------------------------------------------
   * CANCELLED ORDERS
   * -------------------------------------------------------
   */

  @Get('cancelled')
  @ApiOperation({
    summary: 'Get cancelled orders',
  })
  async cancelledOrders(): Promise<Order[]> {
    return this.orderService.cancelledOrders();
  }

  /**
   * -------------------------------------------------------
   * RETURNED ORDERS
   * -------------------------------------------------------
   */

  @Get('returned')
  @ApiOperation({
    summary: 'Get returned orders',
  })
  async returnedOrders(): Promise<Order[]> {
    return this.orderService.returnedOrders();
  }

  /**
   * -------------------------------------------------------
   * CLAIMED ORDERS
   * -------------------------------------------------------
   */

  @Get('claimed')
  @ApiOperation({
    summary: 'Get claimed orders',
  })
  async claimedOrders(): Promise<Order[]> {
    return this.orderService.claimedOrders();
  }
    /**
   * -------------------------------------------------------
   * MARKETPLACE ANALYTICS
   * -------------------------------------------------------
   */

  @Get('analytics/marketplace')
  @ApiOperation({
    summary: 'Marketplace analytics',
  })
  async marketplaceAnalytics() {
    return this.orderService.marketplaceAnalytics();
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE ANALYTICS
   * -------------------------------------------------------
   */

  @Get('analytics/warehouse')
  @ApiOperation({
    summary: 'Warehouse analytics',
  })
  async warehouseAnalytics() {
    return this.orderService.warehouseAnalytics();
  }

  /**
   * -------------------------------------------------------
   * PRIORITY ANALYTICS
   * -------------------------------------------------------
   */

  @Get('analytics/priority')
  @ApiOperation({
    summary: 'Priority analytics',
  })
  async priorityAnalytics() {
    return this.orderService.priorityAnalytics();
  }

  /**
   * -------------------------------------------------------
   * STATUS ANALYTICS
   * -------------------------------------------------------
   */

  @Get('analytics/status')
  @ApiOperation({
    summary: 'Status analytics',
  })
  async statusAnalytics() {
    return this.orderService.statusAnalytics();
  }

  /**
   * -------------------------------------------------------
   * DAILY TREND
   * -------------------------------------------------------
   */

  @Get('analytics/daily-trend')
  @ApiOperation({
    summary: 'Daily order trend',
  })
  async dailyTrend() {
    return this.orderService.dailyTrend();
  }

  /**
   * -------------------------------------------------------
   * DATABASE SUMMARY
   * -------------------------------------------------------
   */

  @Get('database/summary')
  @ApiOperation({
    summary: 'Database summary',
  })
  async databaseSummary() {
    return this.orderService.databaseSummary();
  }

  /**
   * -------------------------------------------------------
   * HEALTH CHECK
   * -------------------------------------------------------
   */

  @Get('health')
  @ApiOperation({
    summary: 'Orders module health',
  })
  async health() {
    return this.orderService.healthCheck();
  }

  /**
   * -------------------------------------------------------
   * DATABASE PING
   * -------------------------------------------------------
   */

  @Get('ping')
  @ApiOperation({
    summary: 'Database ping',
  })
  async ping() {
    return this.orderService.ping();
  }

  /**
   * -------------------------------------------------------
   * EXPORT ORDERS
   * -------------------------------------------------------
   */

  @Post('export')
  @ApiOperation({
    summary: 'Export orders',
  })
  async exportOrders(
    @Body()
    query: OrderQueryDto,
  ) {
    return this.orderService.exportOrders(
      query,
    );
  }

  /**
   * -------------------------------------------------------
   * ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  @Get('archived')
  @ApiOperation({
    summary: 'Archived orders',
  })
  async archivedOrders() {
    return this.orderService.archivedOrders();
  }

  /**
   * -------------------------------------------------------
   * CLEANUP ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  @Delete('cleanup')
  @ApiOperation({
    summary: 'Cleanup archived orders',
  })
  async cleanup(
    @Query('before')
    before: string,
  ) {
    return this.orderService.cleanupSoftDeletedOrders(
      new Date(before),
    );
  }
}