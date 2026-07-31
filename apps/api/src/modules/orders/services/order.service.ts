import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  Order,
  OrderPriority,
  OrderStatus,
  PackingStatus,
  VerificationStatus,
} from '@prisma/client';

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
export class OrderService implements IOrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly stateMachine: OrderStateMachine,
  ) {}

  // ─── CRUD ───────────────────────────────────────────────

  async create(dto: CreateOrderDto): Promise<Order> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<Order> {
    return this.repository.findById(id);
  }

  async findAll(
    query: OrderQueryDto,
  ): Promise<OrderSearchResult<Order>> {
    return this.repository.findAll(query);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    return this.repository.update(id, dto);
  }

  async remove(id: string): Promise<Order> {
    return this.repository.softDelete(id);
  }

  // ─── PRIVATE ────────────────────────────────────────────

  private async getOrder(id: string): Promise<Order> {
    return this.repository.findById(id);
  }

  private validateTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ): void {
    if (!this.stateMachine.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(
        `Invalid order transition: ${currentStatus} → ${nextStatus}`,
      );
    }
  }

  // ─── HELPERS ────────────────────────────────────────────

  async generateOrderNumber(): Promise<string> {
    return this.repository.generateOrderNumber();
  }

  // ─── WORKFLOW ───────────────────────────────────────────

  async assignWarehouse(
    id: string,
    warehouseId: string,
    assignedTo: string,
  ): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.ASSIGNED);

    await this.repository.assignWarehouse(id, warehouseId);
    return this.repository.assignOperator(id, assignedTo);
  }

  async startPicking(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.PICKING);
    return this.repository.updateStatus(id, OrderStatus.PICKING);
  }

  async startPacking(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.PACKING);

    return this.repository.update(id, {
      status: OrderStatus.PACKING,
      packingStatus: PackingStatus.STARTED,
    });
  }

  async completePacking(id: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (order.packingStatus !== PackingStatus.STARTED) {
      throw new BadRequestException('Packing has not been started.');
    }

    return this.repository.update(id, {
      packingStatus: PackingStatus.COMPLETED,
    });
  }

  async startRecording(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.RECORDING);
    return this.repository.updateStatus(id, OrderStatus.RECORDING);
  }

  async completeRecording(id: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (!order.recordingId) {
      throw new BadRequestException(
        'Recording evidence is required before completing recording.',
      );
    }

    return this.repository.update(id, {
      status: OrderStatus.VERIFYING,
    });
  }

  async startVerification(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.VERIFYING);

    if (order.packingStatus !== PackingStatus.COMPLETED) {
      throw new BadRequestException(
        'Packing must be completed before verification.',
      );
    }

    return this.repository.update(id, {
      status: OrderStatus.VERIFYING,
      verificationStatus: VerificationStatus.IN_PROGRESS,
    });
  }

  async completeVerification(id: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (!order.evidenceId) {
      throw new BadRequestException(
        'Evidence is required before verification can be completed.',
      );
    }

    return this.repository.update(id, {
      status: OrderStatus.READY_TO_SHIP,
      verificationStatus: VerificationStatus.PASSED,
    });
  }

  async readyToShip(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.READY_TO_SHIP);
    return this.repository.updateStatus(id, OrderStatus.READY_TO_SHIP);
  }

  async ship(id: string, trackingNumber?: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.SHIPPED);

    if (!trackingNumber && !order.trackingNumber) {
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

    return this.repository.updateStatus(id, OrderStatus.SHIPPED);
  }

  async deliver(id: string): Promise<Order> {
    const order = await this.getOrder(id);
    this.validateTransition(order.status, OrderStatus.DELIVERED);
    return this.repository.updateStatus(id, OrderStatus.DELIVERED);
  }

  async cancel(id: string, reason?: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Delivered orders cannot be cancelled.',
      );
    }

    this.validateTransition(order.status, OrderStatus.CANCELLED);

    return this.repository.update(id, {
      status: OrderStatus.CANCELLED,
      remarks: reason ?? order.remarks ?? undefined,
    });
  }

  async reopen(id: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (order.status !== OrderStatus.CANCELLED) {
      throw new BadRequestException(
        'Only cancelled orders can be reopened.',
      );
    }

    return this.repository.update(id, {
      status: OrderStatus.CREATED,
    });
  }

  async archive(id: string): Promise<Order> {
    const order = await this.getOrder(id);

    if (
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only completed or cancelled orders can be archived.',
      );
    }

    return this.repository.softDelete(id);
  }

  // ─── ATTACHMENTS / TRACKING ─────────────────────────────

  async assignOperator(id: string, operatorId: string): Promise<Order> {
    await this.getOrder(id);
    return this.repository.assignOperator(id, operatorId);
  }

  async updateTracking(
    id: string,
    trackingNumber: string,
    courier: string,
  ): Promise<Order> {
    await this.getOrder(id);
    return this.repository.updateTracking(id, trackingNumber, courier);
  }

  async attachRecording(id: string, recordingId: string): Promise<Order> {
    await this.getOrder(id);
    return this.repository.attachRecording(id, recordingId);
  }

  async attachEvidence(id: string, evidenceId: string): Promise<Order> {
    await this.getOrder(id);
    return this.repository.attachEvidence(id, evidenceId);
  }

  async attachClaim(id: string, claimId: string): Promise<Order> {
    await this.getOrder(id);
    return this.repository.attachClaim(id, claimId);
  }

  async attachReturn(id: string, returnId: string): Promise<Order> {
    await this.getOrder(id);
    return this.repository.attachReturn(id, returnId);
  }

  // ─── STATS / QUEUES ─────────────────────────────────────

  async getStatistics(): Promise<OrderStatistics> {
    return this.repository.statistics();
  }

  async getDashboardSummary() {
    const [
      statistics,
      todayCount,
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
      todayOrders: todayCount,
      packingQueue,
      verificationQueue,
      readyToShipQueue,
    };
  }

  async packingQueue(): Promise<Order[]> {
    return this.repository.packingQueue();
  }

  async verificationQueue(): Promise<Order[]> {
    return this.repository.verificationQueue();
  }

  async readyToShipQueue(): Promise<Order[]> {
    return this.repository.readyToShipQueue();
  }

  async todayOrders(): Promise<Order[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const result = await this.repository.findAll({
      fromDate: start.toISOString(),
      page: 1,
      limit: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    } as OrderQueryDto);

    return result.items;
  }

  async cancelledOrders(): Promise<Order[]> {
    return this.repository.cancelledOrders();
  }

  async returnedOrders(): Promise<Order[]> {
    return this.repository.returnedOrders();
  }

  async claimedOrders(): Promise<Order[]> {
    return this.repository.claimedOrders();
  }

  // ─── FINDERS ────────────────────────────────────────────

  async findByCompany(companyId: string): Promise<Order[]> {
    return this.repository.findByCompany(companyId);
  }

  async findByWarehouse(warehouseId: string): Promise<Order[]> {
    return this.repository.findByWarehouse(warehouseId);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.repository.findByCustomer(customerId);
  }

  async findByAssignedUser(userId: string): Promise<Order[]> {
    return this.repository.findByAssignedUser(userId);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.repository.findByStatus(status);
  }

  async findByPriority(priority: string): Promise<Order[]> {
    return this.repository.findByPriority(priority as OrderPriority);
  }

  async findByPackingStatus(
    packingStatus: PackingStatus,
  ): Promise<Order[]> {
    return this.repository.findByPackingStatus(packingStatus);
  }

  async findByVerificationStatus(
    verificationStatus: VerificationStatus,
  ): Promise<Order[]> {
    return this.repository.findByVerificationStatus(verificationStatus);
  }

  async findByMarketplace(marketplace: string): Promise<Order[]> {
    const result = await this.repository.findAll({
      marketplace: marketplace as any,
      page: 1,
      limit: 1000,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    } as OrderQueryDto);

    return result.items;
  }

  async recentOrders(): Promise<Order[]> {
    return this.repository.recentOrders();
  }

  async highPriorityOrders(): Promise<Order[]> {
    return this.repository.highPriorityOrders();
  }

  async unassignedOrders(): Promise<Order[]> {
    return this.repository.unassignedOrders();
  }

  async ordersWithoutRecording(): Promise<Order[]> {
    return this.repository.ordersWithoutRecording();
  }

  async ordersWithoutEvidence(): Promise<Order[]> {
    return this.repository.ordersWithoutEvidence();
  }

  async overdueOrders(): Promise<Order[]> {
    const before = new Date();
    before.setDate(before.getDate() - 2);
    return this.repository.overdueOrders(before);
  }

  // ─── ANALYTICS ──────────────────────────────────────────

  async marketplaceAnalytics() {
    return this.repository.marketplaceAnalytics();
  }

  async warehouseAnalytics() {
    return this.repository.warehouseAnalytics();
  }

  async priorityAnalytics() {
    return this.repository.priorityAnalytics();
  }

  async statusAnalytics() {
    return this.repository.statusAnalytics();
  }

  async packingAnalytics() {
    return this.repository.packingAnalytics();
  }

  async verificationAnalytics() {
    return this.repository.verificationAnalytics();
  }

  async dailyTrend() {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return this.repository.dailyTrend(from);
  }

  async recentShipments(): Promise<Order[]> {
    return this.repository.recentShipments();
  }

  async recentDeliveries(): Promise<Order[]> {
    return this.repository.recentDeliveries();
  }

  async dashboardAnalytics() {
    const from = new Date();
    from.setDate(from.getDate() - 30);

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
      this.repository.dailyTrend(from),
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

  async databaseStatistics() {
    return this.repository.databaseStatistics();
  }

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  async ping(): Promise<boolean> {
    return this.repository.ping();
  }

  // ─── BATCH ──────────────────────────────────────────────

  async batchUpdateStatus(ids: string[], status: OrderStatus) {
    return this.repository.batchUpdateStatus(ids, status);
  }

  async batchAssignWarehouse(ids: string[], warehouseId: string) {
    return this.repository.batchAssignWarehouse(ids, warehouseId);
  }

  async batchAssignOperator(ids: string[], operatorId: string) {
    return this.repository.batchAssignOperator(ids, operatorId);
  }

  async batchUpdatePriority(ids: string[], priority: string) {
    return this.repository.batchUpdatePriority(
      ids,
      priority as OrderPriority,
    );
  }

  async batchUpdatePackingStatus(
    ids: string[],
    packingStatus: PackingStatus,
  ) {
    return this.repository.batchUpdatePackingStatus(ids, packingStatus);
  }

  async batchUpdateVerificationStatus(
    ids: string[],
    verificationStatus: VerificationStatus,
  ) {
    return this.repository.batchUpdateVerificationStatus(
      ids,
      verificationStatus,
    );
  }

  async batchArchive(ids: string[]) {
    return this.repository.batchSoftDelete(ids);
  }

  async batchRestore(ids: string[]) {
    return this.repository.batchRestore(ids);
  }

  // ─── TRANSACTIONS ───────────────────────────────────────

  async transaction<T>(
  callback: (tx: Parameters<Parameters<OrderRepository['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return this.repository.transaction(callback);
}

  async executeTransaction(
    operations: Parameters<OrderRepository['executeTransaction']>[0],
  ) {
    return this.repository.executeTransaction(operations);
  }

  // ─── LOOKUPS ────────────────────────────────────────────

  async exists(id: string): Promise<boolean> {
    return this.repository.exists(id);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.repository.findByOrderNumber(orderNumber);
  }

  async findByMarketplaceOrderId(
    marketplaceOrderId: string,
  ): Promise<Order | null> {
    return this.repository.findByMarketplaceOrderId(marketplaceOrderId);
  }

  async marketplaceOrderExists(
    marketplace: string,
    marketplaceOrderId: string,
  ): Promise<boolean> {
    return this.repository.marketplaceOrderExists(
      marketplace,
      marketplaceOrderId,
    );
  }

  async trackingExists(trackingNumber: string): Promise<boolean> {
    return this.repository.trackingExists(trackingNumber);
  }

  async pendingMarketplaceSync(): Promise<Order[]> {
    return this.repository.pendingMarketplaceSync();
  }

  async slaBreachedOrders(before: Date): Promise<Order[]> {
    return this.repository.slaBreachedOrders(before);
  }

  async createdBetween(from: Date, to: Date): Promise<Order[]> {
    return this.repository.createdBetween(from, to);
  }

  async exportOrders(query: OrderQueryDto): Promise<Order[]> {
    return this.repository.exportOrders(query as any);
  }

  async archivedOrders(): Promise<Order[]> {
    return this.repository.archivedOrders();
  }

  async latestOrder(): Promise<Order | null> {
    return this.repository.latestOrder();
  }

  async oldestOrder(): Promise<Order | null> {
    return this.repository.oldestOrder();
  }

  async totalActiveOrders(): Promise<number> {
    return this.repository.totalActiveOrders();
  }

  async totalArchivedOrders(): Promise<number> {
    return this.repository.totalArchivedOrders();
  }

  async cleanupSoftDeletedOrders(before: Date) {
    return this.repository.cleanupSoftDeletedOrders(before);
  }

  // ─── MUTATIONS ──────────────────────────────────────────

  async resetAssignment(id: string): Promise<Order> {
    return this.repository.resetAssignment(id);
  }

  async clearTracking(id: string): Promise<Order> {
    return this.repository.clearTracking(id);
  }

  async detachRecording(id: string): Promise<Order> {
    return this.repository.detachRecording(id);
  }

  async detachEvidence(id: string): Promise<Order> {
    return this.repository.detachEvidence(id);
  }

  async detachClaim(id: string): Promise<Order> {
    return this.repository.detachClaim(id);
  }

  async detachReturn(id: string): Promise<Order> {
    return this.repository.detachReturn(id);
  }

  async touch(id: string): Promise<Order> {
    return this.repository.touch(id);
  }

  async orderNumberExists(orderNumber: string): Promise<boolean> {
    return this.repository.orderNumberExists(orderNumber);
  }

  async databaseSummary() {
    return this.repository.databaseStatistics();
  }
}