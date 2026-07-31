import { Injectable, NotFoundException } from '@nestjs/common';

import {
  Prisma,
  Order,
  OrderPriority,
  OrderStatus,
  PackingStatus,
  VerificationStatus,
  Marketplace,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OrderQueryDto } from '../dto/order-query.dto';

import {
  OrderFilter,
  OrderSearchResult,
  OrderStatistics,
} from '../types/order.types';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * -------------------------------------------------------
   * PRIVATE HELPERS
   * -------------------------------------------------------
   */

  private buildWhereClause(query: OrderQueryDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {
      isDeleted: false,
    };

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.assignedTo) {
      where.assignedTo = query.assignedTo;
    }

    if (query.marketplace) {
      where.marketplace = query.marketplace as Marketplace;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.packingStatus) {
      where.packingStatus = query.packingStatus;
    }

    if (query.verificationStatus) {
      where.verificationStatus = query.verificationStatus;
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};

      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }

      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    if (query.search && query.search.trim().length > 0) {
      where.OR = [
        {
          orderNumber: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          marketplaceOrderId: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          trackingNumber: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          courier: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: OrderQueryDto,
  ): Prisma.OrderOrderByWithRelationInput {
    return {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    };
  }

  private pagination(page = 1, limit = 20) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Generates a unique order number.
   *
   * Example:
   * ORD-20260730-000123
   */
  async generateOrderNumber(): Promise<string> {
    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');

    const todayCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        },
      },
    });

    return `ORD-${date}-${String(todayCount + 1).padStart(6, '0')}`;
  }

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();

    return this.prisma.order.create({
      data: {
        orderNumber,
        companyId: dto.companyId,
        warehouseId: dto.warehouseId!,
        customerId: dto.customerId,
        marketplace: dto.marketplace as Marketplace,
        marketplaceOrderId: dto.marketplaceOrderId,
        priority: dto.priority ?? OrderPriority.MEDIUM,
        status: dto.status ?? OrderStatus.CREATED,
        packingStatus: dto.packingStatus ?? PackingStatus.PENDING,
        verificationStatus:
          dto.verificationStatus ?? VerificationStatus.PENDING,
        assignedTo: dto.assignedTo,
        trackingNumber: dto.trackingNumber,
        courier: dto.courier,
        items: dto.items as Prisma.InputJsonValue,
        customer: dto.customer as Prisma.InputJsonValue,
        shippingAddress: dto.shippingAddress as Prisma.InputJsonValue,
        recordingId: dto.recordingId,
        evidenceId: dto.evidenceId,
        claimId: dto.claimId,
        returnId: dto.returnId,
        remarks: dto.remarks,
        metadata: dto.metadata as Prisma.InputJsonValue,
      } as Prisma.OrderUncheckedCreateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(id: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found.`);
    }

    return order;
  }
  /**
   * -------------------------------------------------------
   * FIND BY ORDER NUMBER
   * -------------------------------------------------------
   */

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        isDeleted: false,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found.`);
    }

    return order;
  }

  /**
   * -------------------------------------------------------
   * FIND BY MARKETPLACE ORDER ID
   * -------------------------------------------------------
   */

  async findByMarketplaceOrderId(marketplaceOrderId: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: {
        marketplaceOrderId,
        isDeleted: false,
      },
    });

    if (!order) {
      throw new NotFoundException(`Marketplace order not found.`);
    }

    return order;
  }

  /**
   * -------------------------------------------------------
   * EXISTS
   * -------------------------------------------------------
   */

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        id,
        isDeleted: false,
      },
    });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(query: OrderQueryDto): Promise<OrderSearchResult<Order>> {
    const where = this.buildWhereClause(query);

    const page = query.page ?? 1;

    const limit = query.limit ?? 20;

    const pagination = this.pagination(page, limit);

    const orderBy = this.buildOrderBy(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,

        ...pagination,

        orderBy,
      }),

      this.prisma.order.count({
        where,
      }),
    ]);

    return {
      items,

      total,

      page,

      limit,

      hasNext: page * limit < total,

      hasPrevious: page > 1,
    };
  }

  /**
   * -------------------------------------------------------
   * FIND MANY BY IDS
   * -------------------------------------------------------
   */

  async findManyByIds(ids: string[]): Promise<Order[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.prisma.order.findMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY COMPANY
   * -------------------------------------------------------
   */

  async findByCompany(companyId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        companyId,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY WAREHOUSE
   * -------------------------------------------------------
   */

  async findByWarehouse(warehouseId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        warehouseId,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY CUSTOMER
   * -------------------------------------------------------
   */

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        customerId,
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY ASSIGNEE
   * -------------------------------------------------------
   */

  async findByAssignedUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        assignedTo: userId,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY STATUS
   * -------------------------------------------------------
   */

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY PRIORITY
   * -------------------------------------------------------
   */

  async findByPriority(priority: OrderPriority): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        priority,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY PACKING STATUS
   * -------------------------------------------------------
   */

  async findByPackingStatus(packingStatus: PackingStatus): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        packingStatus,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY VERIFICATION STATUS
   * -------------------------------------------------------
   */

  async findByVerificationStatus(
    verificationStatus: VerificationStatus,
  ): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        verificationStatus,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        companyId: dto.companyId,
        warehouseId: dto.warehouseId,
        customerId: dto.customerId,
        marketplace: dto.marketplace as Marketplace | undefined,
        marketplaceOrderId: dto.marketplaceOrderId,
        priority: dto.priority,
        status: dto.status,
        packingStatus: dto.packingStatus,
        verificationStatus: dto.verificationStatus,
        assignedTo: dto.assignedTo,
        trackingNumber: dto.trackingNumber,
        courier: dto.courier,
        items: dto.items as Prisma.InputJsonValue,
        customer: dto.customer as Prisma.InputJsonValue,
        shippingAddress: dto.shippingAddress as Prisma.InputJsonValue,
        recordingId: dto.recordingId,
        evidenceId: dto.evidenceId,
        claimId: dto.claimId,
        returnId: dto.returnId,
        remarks: dto.remarks,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE STATUS
   * -------------------------------------------------------
   */

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ASSIGN WAREHOUSE
   * -------------------------------------------------------
   */

  async assignWarehouse(id: string, warehouseId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        warehouseId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ASSIGN OPERATOR
   * -------------------------------------------------------
   */

  async assignOperator(id: string, userId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        assignedTo: userId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE TRACKING DETAILS
   * -------------------------------------------------------
   */

  async updateTracking(
    id: string,
    trackingNumber: string,
    courier: string,
  ): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        trackingNumber,
        courier,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ATTACH RECORDING
   * -------------------------------------------------------
   */

  async attachRecording(id: string, recordingId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        recordingId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ATTACH EVIDENCE
   * -------------------------------------------------------
   */

  async attachEvidence(id: string, evidenceId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        evidenceId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ATTACH CLAIM
   * -------------------------------------------------------
   */

  async attachClaim(id: string, claimId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        claimId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ATTACH RETURN
   * -------------------------------------------------------
   */

  async attachReturn(id: string, returnId: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        returnId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE METADATA
   * -------------------------------------------------------
   */

  async updateMetadata(
    id: string,
    metadata: Prisma.JsonObject,
  ): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        metadata,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE CUSTOMER
   * -------------------------------------------------------
   */

  async updateCustomer(
    id: string,
    customer: Prisma.JsonObject,
  ): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        customer,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE SHIPPING ADDRESS
   * -------------------------------------------------------
   */

  async updateShippingAddress(
    id: string,
    shippingAddress: Prisma.JsonObject,
  ): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        shippingAddress,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * UPDATE ITEMS
   * -------------------------------------------------------
   */

  async updateItems(id: string, items: Prisma.JsonArray): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        items,
      },
    });
  }
  /**
   * -------------------------------------------------------
   * SOFT DELETE
   * -------------------------------------------------------
   */

  async softDelete(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RESTORE
   * -------------------------------------------------------
   */

  async restore(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found.`);
    }

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * PERMANENT DELETE
   * -------------------------------------------------------
   */

  async delete(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.delete({
      where: {
        id,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BATCH STATUS UPDATE
   * -------------------------------------------------------
   */

  async batchUpdateStatus(
    ids: string[],
    status: OrderStatus,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        status,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BATCH WAREHOUSE ASSIGNMENT
   * -------------------------------------------------------
   */

  async batchAssignWarehouse(
    ids: string[],
    warehouseId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        warehouseId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BATCH OPERATOR ASSIGNMENT
   * -------------------------------------------------------
   */

  async batchAssignOperator(
    ids: string[],
    operatorId: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        assignedTo: operatorId,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BATCH SOFT DELETE
   * -------------------------------------------------------
   */

  async batchSoftDelete(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BATCH RESTORE
   * -------------------------------------------------------
   */

  async batchRestore(ids: string[]): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: true,
      },

      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK UPDATE PRIORITY
   * -------------------------------------------------------
   */

  async batchUpdatePriority(
    ids: string[],
    priority: OrderPriority,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        priority,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK UPDATE PACKING STATUS
   * -------------------------------------------------------
   */

  async batchUpdatePackingStatus(
    ids: string[],
    packingStatus: PackingStatus,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        packingStatus,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BULK UPDATE VERIFICATION STATUS
   * -------------------------------------------------------
   */

  async batchUpdateVerificationStatus(
    ids: string[],
    verificationStatus: VerificationStatus,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.order.updateMany({
      where: {
        id: {
          in: ids,
        },

        isDeleted: false,
      },

      data: {
        verificationStatus,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * EXECUTE TRANSACTION
   * -------------------------------------------------------
   */

  async transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  /**
   * -------------------------------------------------------
   * EXECUTE MULTIPLE TRANSACTIONS
   * -------------------------------------------------------
   */

  async executeTransaction(operations: Prisma.PrismaPromise<unknown>[]) {
    return this.prisma.$transaction(operations);
  }
  /**
   * -------------------------------------------------------
   * DASHBOARD STATISTICS
   * -------------------------------------------------------
   */

  async statistics(): Promise<OrderStatistics> {
    const total = await this.prisma.order.count({
      where: {
        isDeleted: false,
      },
    });

    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        isDeleted: false,
      },
      _count: {
        status: true,
      },
    });

    const getCount = (status: OrderStatus) =>
      grouped.find((g) => g.status === status)?._count.status ?? 0;

    return {
      total,

      created: getCount(OrderStatus.CREATED),

      assigned: getCount(OrderStatus.ASSIGNED),

      packing: getCount(OrderStatus.PACKING),

      recording: getCount(OrderStatus.RECORDING),

      verifying: getCount(OrderStatus.VERIFYING),

      shipped: getCount(OrderStatus.SHIPPED),

      delivered: getCount(OrderStatus.DELIVERED),

      cancelled: getCount(OrderStatus.CANCELLED),

      returned: getCount(OrderStatus.RETURNED),

      claimed: getCount(OrderStatus.CLAIMED),
    };
  }

  /**
   * -------------------------------------------------------
   * STATUS COUNT
   * -------------------------------------------------------
   */

  async countByStatus(status: OrderStatus): Promise<number> {
    return this.prisma.order.count({
      where: {
        status,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * PRIORITY COUNT
   * -------------------------------------------------------
   */

  async countByPriority(priority: OrderPriority): Promise<number> {
    return this.prisma.order.count({
      where: {
        priority,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE COUNT
   * -------------------------------------------------------
   */

  async countByWarehouse(warehouseId: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        warehouseId,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * OPERATOR COUNT
   * -------------------------------------------------------
   */

  async countByOperator(operatorId: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        assignedTo: operatorId,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * MARKETPLACE COUNT
   * -------------------------------------------------------
   */

  async countByMarketplace(marketplace: string): Promise<number> {
    return this.prisma.order.count({
      where: {
        marketplace: marketplace as Marketplace,
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * TODAY ORDERS
   * -------------------------------------------------------
   */

  async todayOrders(): Promise<number> {
    const today = new Date();

    return this.prisma.order.count({
      where: {
        isDeleted: false,

        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * WEEK ORDERS
   * -------------------------------------------------------
   */

  async weeklyOrders(): Promise<number> {
    const date = new Date();

    date.setDate(date.getDate() - 7);

    return this.prisma.order.count({
      where: {
        isDeleted: false,

        createdAt: {
          gte: date,
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * MONTH ORDERS
   * -------------------------------------------------------
   */

  async monthlyOrders(): Promise<number> {
    const date = new Date();

    date.setMonth(date.getMonth() - 1);

    return this.prisma.order.count({
      where: {
        isDeleted: false,

        createdAt: {
          gte: date,
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS WAITING FOR PACKING
   * -------------------------------------------------------
   */

  async packingQueue(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.PACKING,

        isDeleted: false,
      },

      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS WAITING FOR RECORDING
   * -------------------------------------------------------
   */

  async recordingQueue(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.RECORDING,

        isDeleted: false,
      },

      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS WAITING FOR VERIFICATION
   * -------------------------------------------------------
   */

  async verificationQueue(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.VERIFYING,

        isDeleted: false,
      },

      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * READY TO SHIP
   * -------------------------------------------------------
   */

  async readyToShipQueue(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.READY_TO_SHIP,

        isDeleted: false,
      },

      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * CANCELLED ORDERS
   * -------------------------------------------------------
   */

  async cancelledOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.CANCELLED,

        isDeleted: false,
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RETURNED ORDERS
   * -------------------------------------------------------
   */

  async returnedOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.RETURNED,

        isDeleted: false,
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * CLAIMED ORDERS
   * -------------------------------------------------------
   */

  async claimedOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.CLAIMED,

        isDeleted: false,
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
  /**
   * -------------------------------------------------------
   * RECENT ORDERS
   * -------------------------------------------------------
   */

  async recentOrders(limit = 20): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: limit,
    });
  }

  /**
   * -------------------------------------------------------
   * HIGH PRIORITY ORDERS
   * -------------------------------------------------------
   */

  async highPriorityOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: false,
        priority: {
          in: [OrderPriority.HIGH, OrderPriority.CRITICAL],
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * -------------------------------------------------------
   * UNASSIGNED ORDERS
   * -------------------------------------------------------
   */

  async unassignedOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        assignedTo: null,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS WITHOUT RECORDING
   * -------------------------------------------------------
   */

  async ordersWithoutRecording(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        recordingId: null,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS WITHOUT EVIDENCE
   * -------------------------------------------------------
   */

  async ordersWithoutEvidence(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        evidenceId: null,

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * OVERDUE ORDERS
   * -------------------------------------------------------
   */

  async overdueOrders(before: Date): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        createdAt: {
          lt: before,
        },

        status: {
          notIn: [
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.RETURNED,
            OrderStatus.CLAIMED,
          ],
        },

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * MARKETPLACE ANALYTICS
   * -------------------------------------------------------
   */

  async marketplaceAnalytics() {
    return this.prisma.order.groupBy({
      by: ['marketplace'],

      where: {
        isDeleted: false,
      },

      _count: {
        marketplace: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * WAREHOUSE ANALYTICS
   * -------------------------------------------------------
   */

  async warehouseAnalytics() {
    return this.prisma.order.groupBy({
      by: ['warehouseId'],

      where: {
        isDeleted: false,
      },

      _count: {
        warehouseId: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * PRIORITY ANALYTICS
   * -------------------------------------------------------
   */

  async priorityAnalytics() {
    return this.prisma.order.groupBy({
      by: ['priority'],

      where: {
        isDeleted: false,
      },

      _count: {
        priority: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * STATUS ANALYTICS
   * -------------------------------------------------------
   */

  async statusAnalytics() {
    return this.prisma.order.groupBy({
      by: ['status'],

      where: {
        isDeleted: false,
      },

      _count: {
        status: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * PACKING ANALYTICS
   * -------------------------------------------------------
   */

  async packingAnalytics() {
    return this.prisma.order.groupBy({
      by: ['packingStatus'],

      where: {
        isDeleted: false,
      },

      _count: {
        packingStatus: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * VERIFICATION ANALYTICS
   * -------------------------------------------------------
   */

  async verificationAnalytics() {
    return this.prisma.order.groupBy({
      by: ['verificationStatus'],

      where: {
        isDeleted: false,
      },

      _count: {
        verificationStatus: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DAILY TREND
   * -------------------------------------------------------
   */

  async dailyTrend(from: Date): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: from,
        },

        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RECENT SHIPMENTS
   * -------------------------------------------------------
   */

  async recentShipments(limit = 25): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.SHIPPED,

        isDeleted: false,
      },

      orderBy: {
        updatedAt: 'desc',
      },

      take: limit,
    });
  }

  /**
   * -------------------------------------------------------
   * RECENT DELIVERIES
   * -------------------------------------------------------
   */

  async recentDeliveries(limit = 25): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,

        isDeleted: false,
      },

      orderBy: {
        updatedAt: 'desc',
      },

      take: limit,
    });
  }
  /**
   * -------------------------------------------------------
   * SLA MONITORING
   * -------------------------------------------------------
   */

  async slaBreachedOrders(before: Date): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: false,

        createdAt: {
          lt: before,
        },

        status: {
          notIn: [
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.RETURNED,
            OrderStatus.CLAIMED,
          ],
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE MARKETPLACE ORDER CHECK
   * -------------------------------------------------------
   */

  async marketplaceOrderExists(
    marketplace: string,
    marketplaceOrderId: string,
  ): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        marketplace: marketplace as Marketplace,

        marketplaceOrderId,

        isDeleted: false,
      },
    });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE TRACKING NUMBER CHECK
   * -------------------------------------------------------
   */

  async trackingExists(trackingNumber: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        trackingNumber,

        isDeleted: false,
      },
    });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * PENDING MARKETPLACE SYNC
   * -------------------------------------------------------
   */

  async pendingMarketplaceSync(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: false,

        trackingNumber: null,

        status: {
          in: [OrderStatus.CREATED, OrderStatus.ASSIGNED],
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  async archivedOrders(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: true,
      },

      orderBy: {
        deletedAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * EXPORT ORDERS
   * -------------------------------------------------------
   */

  async exportOrders(filter: OrderFilter): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        companyId: filter.companyId,
        warehouseId: filter.warehouseId,
        customerId: filter.customerId,
        assignedTo: filter.assignedTo,
        marketplace: filter.marketplace as Marketplace | undefined,
        status: filter.status,
        priority: filter.priority,
        packingStatus: filter.packingStatus,
        verificationStatus: filter.verificationStatus,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * -------------------------------------------------------
   * LAST CREATED ORDER
   * -------------------------------------------------------
   */

  async latestOrder(): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: {
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FIRST CREATED ORDER
   * -------------------------------------------------------
   */

  async oldestOrder(): Promise<Order | null> {
    return this.prisma.order.findFirst({
      where: {
        isDeleted: false,
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDERS CREATED BETWEEN DATES
   * -------------------------------------------------------
   */

  async createdBetween(from: Date, to: Date): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        isDeleted: false,

        createdAt: {
          gte: from,
          lte: to,
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * COUNT ALL ACTIVE ORDERS
   * -------------------------------------------------------
   */

  async totalActiveOrders(): Promise<number> {
    return this.prisma.order.count({
      where: {
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * COUNT ARCHIVED ORDERS
   * -------------------------------------------------------
   */

  async totalArchivedOrders(): Promise<number> {
    return this.prisma.order.count({
      where: {
        isDeleted: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * HEALTH CHECK
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    await this.prisma.order.findFirst({
      select: {
        id: true,
      },
    });

    return true;
  }

  /**
   * -------------------------------------------------------
   * DATABASE PING
   * -------------------------------------------------------
   */

  async ping(): Promise<boolean> {
    await this.prisma.$queryRaw`
      SELECT 1
    `;

    return true;
  }
  /**
   * -------------------------------------------------------
   * CLEANUP SOFT DELETED ORDERS
   * -------------------------------------------------------
   */

  async cleanupSoftDeletedOrders(before: Date): Promise<Prisma.BatchPayload> {
    return this.prisma.order.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lt: before,
        },
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RESET ASSIGNMENT
   * -------------------------------------------------------
   */

  async resetAssignment(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: { id },
      data: {
        assignedTo: null,
        status: OrderStatus.CREATED,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * REMOVE TRACKING DETAILS
   * -------------------------------------------------------
   */

  async clearTracking(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        trackingNumber: null,
        courier: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * REMOVE RECORDING LINK
   * -------------------------------------------------------
   */

  async detachRecording(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        recordingId: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * REMOVE EVIDENCE LINK
   * -------------------------------------------------------
   */

  async detachEvidence(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        evidenceId: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * REMOVE CLAIM LINK
   * -------------------------------------------------------
   */

  async detachClaim(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        claimId: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * REMOVE RETURN LINK
   * -------------------------------------------------------
   */

  async detachReturn(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        returnId: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * TOUCH ORDER
   * Updates updatedAt timestamp.
   * -------------------------------------------------------
   */

  async touch(id: string): Promise<Order> {
    await this.findById(id);

    return this.prisma.order.update({
      where: {
        id,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ORDER EXISTS BY ORDER NUMBER
   * -------------------------------------------------------
   */

  async orderNumberExists(orderNumber: string): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        orderNumber,
      },
    });

    return count > 0;
  }

  /**
   * -------------------------------------------------------
   * TOTAL ORDERS
   * -------------------------------------------------------
   */

  async totalOrders(): Promise<number> {
    return this.prisma.order.count();
  }

  /**
   * -------------------------------------------------------
   * ACTIVE ORDERS
   * -------------------------------------------------------
   */

  async activeOrders(): Promise<number> {
    return this.prisma.order.count({
      where: {
        isDeleted: false,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DELETED ORDERS
   * -------------------------------------------------------
   */

  async deletedOrders(): Promise<number> {
    return this.prisma.order.count({
      where: {
        isDeleted: true,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DATABASE STATISTICS
   * -------------------------------------------------------
   */

  async databaseStatistics() {
    const [total, active, deleted] = await Promise.all([
      this.totalOrders(),
      this.activeOrders(),
      this.deletedOrders(),
    ]);

    return {
      total,
      active,
      deleted,
    };
  }
}
