import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { Order } from '@prisma/client';

import { OrderRepository } from '../repositories/order.repository';

import { OrderStateMachine } from '../utils/order-state-machine';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

import { IOrderService } from '../interfaces/order.interface';

import {
  OrderSearchResult,
  OrderStatistics,
} from '../types/order.types';

@Injectable()
export class OrderService
  implements IOrderService
{
  constructor(
    private readonly repository: OrderRepository,

    private readonly stateMachine: OrderStateMachine,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(
    dto: CreateOrderDto,
  ): Promise<Order> {
    return this.repository.create(dto);
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<Order> {
    return this.repository.findById(id);
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(
    query: OrderQueryDto,
  ): Promise<
    OrderSearchResult<Order>
  > {
    return this.repository.findAll(query);
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.repository.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE
   * -------------------------------------------------------
   */

  async remove(
    id: string,
  ): Promise<Order> {
    return this.repository.softDelete(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * PRIVATE HELPERS
   * -------------------------------------------------------
   */

  private async getOrder(
    id: string,
  ): Promise<Order> {
    return this.repository.findById(id);
  }

  private validateTransition(
    currentStatus: any,
    nextStatus: any,
  ): void {
    const allowed =
      this.stateMachine.canTransition(
        currentStatus,
        nextStatus,
      );

    if (!allowed) {
      throw new BadRequestException(
        `Invalid order transition: ${currentStatus} → ${nextStatus}`,
      );
    }
  }

  /**
   * -------------------------------------------------------
   * GENERATE ORDER NUMBER
   * -------------------------------------------------------
   */

  async generateOrderNumber(): Promise<string> {
    return this.repository.generateOrderNumber();
  }
    /**
   * -------------------------------------------------------
   * ASSIGN WAREHOUSE
   * -------------------------------------------------------
   */

  async assignWarehouse(
    id: string,
    warehouseId: string,
    assignedTo: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.ASSIGNED,
    );

    return this.repository.assignWarehouse(
      id,
      warehouseId,
      assignedTo,
    );
  }

  /**
   * -------------------------------------------------------
   * START PICKING
   * -------------------------------------------------------
   */

  async startPicking(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.PICKING,
    );

    return this.repository.updateStatus(
      id,
      OrderStatus.PICKING,
    );
  }

  /**
   * -------------------------------------------------------
   * START PACKING
   * -------------------------------------------------------
   */

  async startPacking(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.PACKING,
    );

    return this.repository.update(
      id,
      {
        status:
          OrderStatus.PACKING,

        packingStatus:
          PackingStatus.STARTED,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * COMPLETE PACKING
   * -------------------------------------------------------
   */

  async completePacking(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (
      order.packingStatus !==
      PackingStatus.STARTED
    ) {
      throw new BadRequestException(
        'Packing has not been started.',
      );
    }

    return this.repository.update(
      id,
      {
        packingStatus:
          PackingStatus.COMPLETED,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * START RECORDING
   * -------------------------------------------------------
   */

  async startRecording(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.RECORDING,
    );

    return this.repository.updateStatus(
      id,
      OrderStatus.RECORDING,
    );
  }

  /**
   * -------------------------------------------------------
   * COMPLETE RECORDING
   * -------------------------------------------------------
   */

  async completeRecording(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (!order.recordingId) {
      throw new BadRequestException(
        'Recording evidence is required before completing recording.',
      );
    }

    return this.repository.update(
      id,
      {
        status:
          OrderStatus.VERIFYING,
      },
    );
  }
    /**
   * -------------------------------------------------------
   * START VERIFICATION
   * -------------------------------------------------------
   */

  async startVerification(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.VERIFYING,
    );

    if (
      order.packingStatus !==
      PackingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Packing must be completed before verification.',
      );
    }

    return this.repository.update(
      id,
      {
        status:
          OrderStatus.VERIFYING,

        verificationStatus:
          VerificationStatus.IN_PROGRESS,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * COMPLETE VERIFICATION
   * -------------------------------------------------------
   */

  async completeVerification(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (!order.evidenceId) {
      throw new BadRequestException(
        'Evidence is required before verification can be completed.',
      );
    }

    return this.repository.update(
      id,
      {
        status:
          OrderStatus.READY_TO_SHIP,

        verificationStatus:
          VerificationStatus.PASSED,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * READY TO SHIP
   * -------------------------------------------------------
   */

  async readyToShip(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.READY_TO_SHIP,
    );

    return this.repository.updateStatus(
      id,
      OrderStatus.READY_TO_SHIP,
    );
  }

  /**
   * -------------------------------------------------------
   * SHIP ORDER
   * -------------------------------------------------------
   */

  async ship(
    id: string,
    trackingNumber?: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.SHIPPED,
    );

    if (
      !trackingNumber &&
      !order.trackingNumber
    ) {
      throw new BadRequestException(
        'Tracking number is required before shipping.',
      );
    }

    if (trackingNumber) {
      await this.repository.updateTracking(
        id,
        trackingNumber,
        order.courier ?? '',
      );
    }

    return this.repository.updateStatus(
      id,
      OrderStatus.SHIPPED,
    );
  }

  /**
   * -------------------------------------------------------
   * DELIVER ORDER
   * -------------------------------------------------------
   */

  async deliver(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    this.validateTransition(
      order.status,
      OrderStatus.DELIVERED,
    );

    return this.repository.updateStatus(
      id,
      OrderStatus.DELIVERED,
    );
  }

  /**
   * -------------------------------------------------------
   * CANCEL ORDER
   * -------------------------------------------------------
   */

  async cancel(
    id: string,
    reason?: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (
      order.status ===
      OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Delivered orders cannot be cancelled.',
      );
    }

    this.validateTransition(
      order.status,
      OrderStatus.CANCELLED,
    );

    return this.repository.update(
      id,
      {
        status:
          OrderStatus.CANCELLED,

        remarks:
          reason ??
          order.remarks,
      },
    );
  }
    /**
   * -------------------------------------------------------
   * REOPEN ORDER
   * -------------------------------------------------------
   */

  async reopen(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (
      order.status !==
      OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only cancelled orders can be reopened.',
      );
    }

    return this.repository.update(
      id,
      {
        status: OrderStatus.CREATED,
      },
    );
  }

  /**
   * -------------------------------------------------------
   * ARCHIVE ORDER
   * -------------------------------------------------------
   */

  async archive(
    id: string,
  ): Promise<Order> {
    const order =
      await this.getOrder(id);

    if (
      order.status !==
        OrderStatus.DELIVERED &&
      order.status !==
        OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only completed or cancelled orders can be archived.',
      );
    }

    return this.repository.softDelete(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * ASSIGN OPERATOR
   * -------------------------------------------------------
   */

  async assignOperator(
    id: string,
    operatorId: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.assignOperator(
      id,
      operatorId,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE TRACKING
   * -------------------------------------------------------
   */

  async updateTracking(
    id: string,
    trackingNumber: string,
    courier: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.updateTracking(
      id,
      trackingNumber,
      courier,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH RECORDING
   * -------------------------------------------------------
   */

  async attachRecording(
    id: string,
    recordingId: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.attachRecording(
      id,
      recordingId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH EVIDENCE
   * -------------------------------------------------------
   */

  async attachEvidence(
    id: string,
    evidenceId: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.attachEvidence(
      id,
      evidenceId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH CLAIM
   * -------------------------------------------------------
   */

  async attachClaim(
    id: string,
    claimId: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.attachClaim(
      id,
      claimId,
    );
  }

  /**
   * -------------------------------------------------------
   * ATTACH RETURN
   * -------------------------------------------------------
   */

  async attachReturn(
    id: string,
    returnId: string,
  ): Promise<Order> {
    await this.getOrder(id);

    return this.repository.attachReturn(
      id,
      returnId,
    );
  }

  /**
   * -------------------------------------------------------
   * GET ORDER STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(): Promise<OrderStatistics> {
    return this.repository.statistics();
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD SUMMARY
   * -------------------------------------------------------
   */

  async getDashboardSummary() {
    const [
      statistics,
      todayOrders,
      packingQueue,
      verificationQueue,
      readyToShipQueue,
    ] = await Promise.all([
      this.repository.statistics(),
      this.repository.todayOrders(),
      this.repository.packingQueue(),
      this.repository.verificationQueue(),
      this.repository.readyToShipQueue(),
    ]);

    return {
      statistics,
      todayOrders,
      packingQueue,
      verificationQueue,
      readyToShipQueue,
    };
  }
    /**
   * -------------------------------------------------------
   * FIND BY COMPANY
   * -------------------------------------------------------
   */

  async findByCompany(
    companyId: string,
  ): Promise<Order[]> {
    return this.repository.findByCompany(
      companyId,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY WAREHOUSE
   * -------------------------------------------------------
   */

  async findByWarehouse(
    warehouseId: string,
  ): Promise<Order[]> {
    return this.repository.findByWarehouse(
      warehouseId,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY CUSTOMER
   * -------------------------------------------------------
   */

  async findByCustomer(
    customerId: string,
  ): Promise<Order[]> {
    return this.repository.findByCustomer(
      customerId,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY ASSIGNED USER
   * -------------------------------------------------------
   */

  async findByAssignedUser(
    userId: string,
  ): Promise<Order[]> {
    return this.repository.findByAssignedUser(
      userId,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY STATUS
   * -------------------------------------------------------
   */

  async findByStatus(
    status: OrderStatus,
  ): Promise<Order[]> {
    return this.repository.findByStatus(
      status,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY PRIORITY
   * -------------------------------------------------------
   */

  async findByPriority(
    priority: string,
  ): Promise<Order[]> {
    return this.repository.findByPriority(
      priority,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY PACKING STATUS
   * -------------------------------------------------------
   */

  async findByPackingStatus(
    packingStatus: PackingStatus,
  ): Promise<Order[]> {
    return this.repository.findByPackingStatus(
      packingStatus,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY VERIFICATION STATUS
   * -------------------------------------------------------
   */

  async findByVerificationStatus(
    verificationStatus: VerificationStatus,
  ): Promise<Order[]> {
    return this.repository.findByVerificationStatus(
      verificationStatus,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY MARKETPLACE
   * -------------------------------------------------------
   */

  async findByMarketplace(
    marketplace: string,
  ): Promise<Order[]> {
    const result =
      await this.repository.findAll({
        marketplace,
        page: 1,
        limit: 1000,
      });

    return result.data;
  }

  /**
   * -------------------------------------------------------
   * RECENT ORDERS
   * -------------------------------------------------------
   */

  async recentOrders(): Promise<Order[]> {
    return this.repository.recentOrders();
  }

  /**
   * -------------------------------------------------------
   * HIGH PRIORITY ORDERS
   * -------------------------------------------------------
   */

  async highPriorityOrders(): Promise<Order[]> {
    return this.repository.highPriorityOrders();
  }

  /**
   * -------------------------------------------------------
   * UNASSIGNED ORDERS
   * -------------------------------------------------------
   */

  async unassignedOrders(): Promise<Order[]> {
    return this.repository.unassignedOrders();
  }

  /**
   * -------------------------------------------------------
   * ORDERS WITHOUT RECORDING
   * -------------------------------------------------------
   */

  async ordersWithoutRecording(): Promise<Order[]> {
    return this.repository.ordersWithoutRecording();
  }

  /**
   * -------------------------------------------------------
   * ORDERS WITHOUT EVIDENCE
   * -------------------------------------------------------
   */

  async ordersWithoutEvidence(): Promise<Order[]> {
    return this.repository.ordersWithoutEvidence();
  }

  /**
   * -------------------------------------------------------
   * OVERDUE ORDERS
   * -------------------------------------------------------
   */

  async overdueOrders(): Promise<Order[]> {
    return this.repository.overdueOrders();
  }
    /**
   * -------------------------------------------------------
   * MARKETPLACE ANALYTICS
   * -------------------------------------------------------
   */

  async marketplaceAnalytics() {
    return this.repository.marketplaceAnalytics();
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE ANALYTICS
   * -------------------------------------------------------
   */

  async warehouseAnalytics() {
    return this.repository.warehouseAnalytics();
  }

  /**
   * -------------------------------------------------------
   * PRIORITY ANALYTICS
   * -------------------------------------------------------
   */

  async priorityAnalytics() {
    return this.repository.priorityAnalytics();
  }

  /**
   * -------------------------------------------------------
   * STATUS ANALYTICS
   * -------------------------------------------------------
   */

  async statusAnalytics() {
    return this.repository.statusAnalytics();
  }

  /**
   * -------------------------------------------------------
   * PACKING ANALYTICS
   * -------------------------------------------------------
   */

  async packingAnalytics() {
    return this.repository.packingAnalytics();
  }

  /**
   * -------------------------------------------------------
   * VERIFICATION ANALYTICS
   * -------------------------------------------------------
   */

  async verificationAnalytics() {
    return this.repository.verificationAnalytics();
  }

  /**
   * -------------------------------------------------------
   * DAILY ORDER TREND
   * -------------------------------------------------------
   */

  async dailyTrend() {
    return this.repository.dailyTrend();
  }

  /**
   * -------------------------------------------------------
   * RECENT SHIPMENTS
   * -------------------------------------------------------
   */

  async recentShipments(): Promise<Order[]> {
    return this.repository.recentShipments();
  }

  /**
   * -------------------------------------------------------
   * RECENT DELIVERIES
   * -------------------------------------------------------
   */

  async recentDeliveries(): Promise<Order[]> {
    return this.repository.recentDeliveries();
  }

  /**
   * -------------------------------------------------------
   * DASHBOARD ANALYTICS
   * -------------------------------------------------------
   */

  async dashboardAnalytics() {
    const [
      statistics,
      marketplace,
      warehouse,
      priority,
      status,
      packing,
      verification,
      trend,
      recentShipments,
      recentDeliveries,
    ] = await Promise.all([
      this.repository.statistics(),
      this.repository.marketplaceAnalytics(),
      this.repository.warehouseAnalytics(),
      this.repository.priorityAnalytics(),
      this.repository.statusAnalytics(),
      this.repository.packingAnalytics(),
      this.repository.verificationAnalytics(),
      this.repository.dailyTrend(),
      this.repository.recentShipments(),
      this.repository.recentDeliveries(),
    ]);

    return {
      statistics,
      analytics: {
        marketplace,
        warehouse,
        priority,
        status,
        packing,
        verification,
        trend,
      },
      recent: {
        shipments: recentShipments,
        deliveries: recentDeliveries,
      },
    };
  }

  /**
   * -------------------------------------------------------
   * DATABASE STATISTICS
   * -------------------------------------------------------
   */

  async databaseStatistics() {
    return this.repository.databaseStatistics();
  }

  /**
   * -------------------------------------------------------
   * HEALTH CHECK
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  /**
   * -------------------------------------------------------
   * DATABASE PING
   * -------------------------------------------------------
   */

  async ping(): Promise<boolean> {
    return this.repository.ping();
  }
    /**
   * -------------------------------------------------------
   * BATCH UPDATE STATUS
   * -------------------------------------------------------
   */

  async batchUpdateStatus(
    ids: string[],
    status: OrderStatus,
  ) {
    return this.repository.batchUpdateStatus(
      ids,
      status,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH ASSIGN WAREHOUSE
   * -------------------------------------------------------
   */

  async batchAssignWarehouse(
    ids: string[],
    warehouseId: string,
  ) {
    return this.repository.batchAssignWarehouse(
      ids,
      warehouseId,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH ASSIGN OPERATOR
   * -------------------------------------------------------
   */

  async batchAssignOperator(
    ids: string[],
    operatorId: string,
  ) {
    return this.repository.batchAssignOperator(
      ids,
      operatorId,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH UPDATE PRIORITY
   * -------------------------------------------------------
   */

  async batchUpdatePriority(
    ids: string[],
    priority: string,
  ) {
    return this.repository.batchUpdatePriority(
      ids,
      priority,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH UPDATE PACKING STATUS
   * -------------------------------------------------------
   */

  async batchUpdatePackingStatus(
    ids: string[],
    packingStatus: PackingStatus,
  ) {
    return this.repository.batchUpdatePackingStatus(
      ids,
      packingStatus,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH UPDATE VERIFICATION STATUS
   * -------------------------------------------------------
   */

  async batchUpdateVerificationStatus(
    ids: string[],
    verificationStatus: VerificationStatus,
  ) {
    return this.repository.batchUpdateVerificationStatus(
      ids,
      verificationStatus,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH ARCHIVE
   * -------------------------------------------------------
   */

  async batchArchive(
    ids: string[],
  ) {
    return this.repository.batchSoftDelete(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * BATCH RESTORE
   * -------------------------------------------------------
   */

  async batchRestore(
    ids: string[],
  ) {
    return this.repository.batchRestore(
      ids,
    );
  }

  /**
   * -------------------------------------------------------
   * EXECUTE TRANSACTION
   * -------------------------------------------------------
   */

  async transaction<T>(
    callback: Parameters<
      OrderRepository['transaction']
    >[0],
  ): Promise<T> {
    return this.repository.transaction<T>(
      callback,
    );
  }

  /**
   * -------------------------------------------------------
   * EXECUTE MULTIPLE DATABASE OPERATIONS
   * -------------------------------------------------------
   */

  async executeTransaction(
    operations: Parameters<
      OrderRepository['executeTransaction']
    >[0],
  ) {
    return this.repository.executeTransaction(
      operations,
    );
  }

  /**
   * -------------------------------------------------------
   * ORDER EXISTS
   * -------------------------------------------------------
   */

  async exists(
    id: string,
  ): Promise<boolean> {
    return this.repository.exists(id);
  }

  /**
   * -------------------------------------------------------
   * FIND BY ORDER NUMBER
   * -------------------------------------------------------
   */

  async findByOrderNumber(
    orderNumber: string,
  ): Promise<Order | null> {
    return this.repository.findByOrderNumber(
      orderNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * FIND BY MARKETPLACE ORDER ID
   * -------------------------------------------------------
   */

  async findByMarketplaceOrderId(
    marketplaceOrderId: string,
  ): Promise<Order | null> {
    return this.repository.findByMarketplaceOrderId(
      marketplaceOrderId,
    );
  }

  /**
   * -------------------------------------------------------
   * MARKETPLACE ORDER EXISTS
   * -------------------------------------------------------
   */

  async marketplaceOrderExists(
    marketplace: string,
    marketplaceOrderId: string,
  ): Promise<boolean> {
    return this.repository.marketplaceOrderExists(
      marketplace,
      marketplaceOrderId,
    );
  }

  /**
   * -------------------------------------------------------
   * TRACKING NUMBER EXISTS
   * -------------------------------------------------------
   */

  async trackingExists(
    trackingNumber: string,
  ): Promise<boolean> {
    return this.repository.trackingExists(
      trackingNumber,
    );
  }
    /**
   * -------------------------------------------------------
   * PENDING MARKETPLACE SYNC
   * -------------------------------------------------------
   */

  async pendingMarketplaceSync(): Promise<Order[]> {
    return this.repository.pendingMarketplaceSync();
  }

  /**
   * -------------------------------------------------------
   * SLA BREACHED ORDERS
   * -------------------------------------------------------
   */

  async slaBreachedOrders(
    before: Date,
  ): Promise<Order[]> {
    return this.repository.slaBreachedOrders(
      before,
    );
  }

  /**
   * -------------------------------------------------------
   * CREATED BETWEEN DATES
   * -------------------------------------------------------
   */

  async createdBetween(
    from: Date,
    to: Date,
  ): Promise<Order[]> {
    return this.repository.createdBetween(
      from,
      to,
    );
  }

  /**
   * -------------------------------------------------------
   * EXPORT ORDERS
   * -------------------------------------------------------
   */

  async exportOrders(
    query: OrderQueryDto,
  ): Promise<Order[]> {
    return this.repository.exportOrders(
      query,
    );
  }

  /**
   * -------------------------------------------------------
   * ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  async archivedOrders(): Promise<Order[]> {
    return this.repository.archivedOrders();
  }

  /**
   * -------------------------------------------------------
   * LATEST ORDER
   * -------------------------------------------------------
   */

  async latestOrder(): Promise<Order | null> {
    return this.repository.latestOrder();
  }

  /**
   * -------------------------------------------------------
   * OLDEST ORDER
   * -------------------------------------------------------
   */

  async oldestOrder(): Promise<Order | null> {
    return this.repository.oldestOrder();
  }

  /**
   * -------------------------------------------------------
   * TOTAL ACTIVE ORDERS
   * -------------------------------------------------------
   */

  async totalActiveOrders(): Promise<number> {
    return this.repository.totalActiveOrders();
  }

  /**
   * -------------------------------------------------------
   * TOTAL ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  async totalArchivedOrders(): Promise<number> {
    return this.repository.totalArchivedOrders();
  }

  /**
   * -------------------------------------------------------
   * CLEANUP SOFT-DELETED ORDERS
   * -------------------------------------------------------
   */

  async cleanupSoftDeletedOrders(
    before: Date,
  ) {
    return this.repository.cleanupSoftDeletedOrders(
      before,
    );
  }

  /**
   * -------------------------------------------------------
   * RESET ASSIGNMENT
   * -------------------------------------------------------
   */

  async resetAssignment(
    id: string,
  ): Promise<Order> {
    return this.repository.resetAssignment(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * CLEAR TRACKING
   * -------------------------------------------------------
   */

  async clearTracking(
    id: string,
  ): Promise<Order> {
    return this.repository.clearTracking(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * DETACH RECORDING
   * -------------------------------------------------------
   */

  async detachRecording(
    id: string,
  ): Promise<Order> {
    return this.repository.detachRecording(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * DETACH EVIDENCE
   * -------------------------------------------------------
   */

  async detachEvidence(
    id: string,
  ): Promise<Order> {
    return this.repository.detachEvidence(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * DETACH CLAIM
   * -------------------------------------------------------
   */

  async detachClaim(
    id: string,
  ): Promise<Order> {
    return this.repository.detachClaim(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * DETACH RETURN
   * -------------------------------------------------------
   */

  async detachReturn(
    id: string,
  ): Promise<Order> {
    return this.repository.detachReturn(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * TOUCH ORDER
   * -------------------------------------------------------
   */

  async touch(
    id: string,
  ): Promise<Order> {
    return this.repository.touch(
      id,
    );
  }

  /**
   * -------------------------------------------------------
   * ORDER NUMBER EXISTS
   * -------------------------------------------------------
   */

  async orderNumberExists(
    orderNumber: string,
  ): Promise<boolean> {
    return this.repository.orderNumberExists(
      orderNumber,
    );
  }

  /**
   * -------------------------------------------------------
   * DATABASE SUMMARY
   * -------------------------------------------------------
   */

  async databaseSummary() {
    return this.repository.databaseStatistics();
  }
}