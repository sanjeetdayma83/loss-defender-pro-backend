import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  CreateOrderDto,
  AssignOrderDto,
  UpdateOrderStatusDto,
  ScanItemDto,
} from './dto/order.dto';
import { OrderStatus, OrderItemStatus, Prisma } from '@prisma/client';

/** Allowed status transitions (docs §8.3 simplified for P0) */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  synced: ['queued', 'packing'],
  queued: ['packing'],
  packing: ['recording', 'scanned'],
  recording: ['scanned'],
  scanned: ['evidence_ready', 'packing'],
  evidence_ready: ['dispatched'],
  dispatched: ['shipped', 'claimed', 'returned'],
  shipped: ['closed', 'claimed', 'returned'],
  claimed: ['closed'],
  returned: ['closed'],
  closed: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(companyId: string, status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
      },
      include: {
        items: true,
        warehouse: { select: { id: true, name: true, code: true } },
        assignedOperator: { select: { id: true, name: true, email: true } },
        station: { select: { id: true, stationName: true, stationId: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getOne(companyId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, companyId },
      include: {
        items: true,
        warehouse: true,
        assignedOperator: { select: { id: true, name: true, email: true, role: true } },
        station: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(companyId: string, actorId: string, dto: CreateOrderDto, ip?: string) {
    if (!dto.items?.length) {
      throw new BadRequestException('At least one item is required');
    }

    if (dto.warehouseId) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, companyId },
      });
      if (!wh) throw new BadRequestException('Warehouse not in your company');
    }

    const order = await this.prisma.order.create({
      data: {
        companyId,
        warehouseId: dto.warehouseId,
        marketplace: dto.marketplace ?? 'manual',
        marketplaceOrderId: dto.marketplaceOrderId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress as Prisma.InputJsonValue,
        notes: dto.notes,
        status: 'synced',
        items: {
          create: dto.items.map((i) => ({
            sku: i.sku,
            name: i.name,
            qty: i.qty,
            barcode: i.barcode,
            scannedQty: 0,
            status: 'pending',
          })),
        },
      },
      include: { items: true },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'order.create',
      entity: 'Order',
      entityId: order.id,
      after: order as any,
      ipAddress: ip,
    });

    return order;
  }

  async assign(
    companyId: string,
    id: string,
    actorId: string,
    dto: AssignOrderDto,
    ip?: string,
  ) {
    const order = await this.prisma.order.findFirst({ where: { id, companyId } });
    if (!order) throw new NotFoundException('Order not found');

    const operator = await this.prisma.user.findFirst({
      where: { id: dto.operatorId, companyId, status: { not: 'deleted' } },
    });
    if (!operator) throw new BadRequestException('Operator not found in company');

    if (dto.stationId) {
      const station = await this.prisma.station.findFirst({
        where: { id: dto.stationId },
        include: { warehouse: true },
      });
      if (!station || station.warehouse.companyId !== companyId) {
        throw new BadRequestException('Station not in your company');
      }
    }

    if (dto.warehouseId) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, companyId },
      });
      if (!wh) throw new BadRequestException('Warehouse not in your company');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        assignedOperatorId: dto.operatorId,
        stationId: dto.stationId,
        warehouseId: dto.warehouseId ?? order.warehouseId,
        status: order.status === 'synced' ? 'queued' : order.status,
      },
      include: { items: true, assignedOperator: { select: { id: true, name: true } } },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'order.assign',
      entity: 'Order',
      entityId: id,
      before: { assignedOperatorId: order.assignedOperatorId, status: order.status } as any,
      after: {
        assignedOperatorId: updated.assignedOperatorId,
        status: updated.status,
      } as any,
      ipAddress: ip,
    });

    return updated;
  }

  async updateStatus(
    companyId: string,
    id: string,
    actorId: string,
    dto: UpdateOrderStatusDto,
    ip?: string,
  ) {
    const order = await this.prisma.order.findFirst({ where: { id, companyId } });
    if (!order) throw new NotFoundException('Order not found');

    const allowed = TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
    }

    const data: Prisma.OrderUpdateInput = { status: dto.status };
    if (dto.status === 'dispatched') {
      data.dispatchedAt = new Date();
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'order.status_change',
      entity: 'Order',
      entityId: id,
      before: { status: order.status } as any,
      after: { status: updated.status } as any,
      ipAddress: ip,
    });

    return updated;
  }

  /**
   * Scanner: match barcode/SKU on order items, increment scannedQty.
   * Docs §11.1 — duplicate / wrong SKU / complete detection.
   */
  async scan(
    companyId: string,
    orderId: string,
    actorId: string,
    dto: ScanItemDto,
    ip?: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, companyId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (!['synced', 'queued', 'packing', 'recording', 'scanned'].includes(order.status)) {
      throw new BadRequestException(`Cannot scan in status ${order.status}`);
    }

    const code = dto.barcodeOrSku.trim();
    const item = order.items.find(
      (i) => i.sku === code || i.barcode === code,
    );

    if (!item) {
      throw new BadRequestException({
        code: 'WRONG_SKU',
        message: `Barcode/SKU "${code}" is not on this order`,
      });
    }

    if (item.scannedQty >= item.qty) {
      throw new ConflictException({
        code: 'ALREADY_SCANNED',
        message: `SKU ${item.sku} already fully scanned (${item.scannedQty}/${item.qty})`,
      });
    }

    const newQty = item.scannedQty + 1;
    let itemStatus: OrderItemStatus = 'partial';
    if (newQty >= item.qty) itemStatus = 'matched';

    await this.prisma.orderItem.update({
      where: { id: item.id },
      data: { scannedQty: newQty, status: itemStatus },
    });

    const refreshed = await this.prisma.order.findFirst({
      where: { id: orderId },
      include: { items: true },
    });

    const allMatched = refreshed!.items.every((i) => i.scannedQty >= i.qty);
    if (allMatched && refreshed!.status !== 'scanned') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'scanned' },
      });
    } else if (['synced','queued'].includes(refreshed!.status)) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'packing' },
      });
    }

    const result = await this.getOne(companyId, orderId);

    await this.audit.log({
      companyId,
      actorId,
      action: 'order.scan',
      entity: 'OrderItem',
      entityId: item.id,
      after: { sku: item.sku, scannedQty: newQty, status: itemStatus } as any,
      ipAddress: ip,
    });

    return {
      scan: {
        sku: item.sku,
        scannedQty: newQty,
        qty: item.qty,
        itemStatus,
        allMatched,
      },
      order: result,
    };
  }
  async dispatch(
    companyId: string,
    id: string,
    actorId: string,
    dto: { awb: string; courier: string },
    ip?: string,
  ) {
    const order = await this.prisma.order.findFirst({ where: { id, companyId } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'evidence_ready' && order.status !== 'scanned') {
      throw new BadRequestException(
        `Cannot dispatch from status ${order.status}; need scanned or evidence_ready`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'dispatched',
        awb: dto.awb,
        courier: dto.courier,
        dispatchedAt: new Date(),
      },
      include: { items: true },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'order.dispatch',
      entity: 'Order',
      entityId: id,
      before: { status: order.status, awb: order.awb } as any,
      after: { status: updated.status, awb: updated.awb, courier: updated.courier } as any,
      ipAddress: ip,
    });

    return updated;
  }
}