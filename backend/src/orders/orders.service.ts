import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { tenantWhere } from '../common/utils/tenant';

const ALLOWED: Record<string, string[]> = {
  synced: ['queued', 'packing'],
  queued: ['packing', 'scanned', 'failed'],
  scanned: ['packing', 'recording'],
  packing: ['recording', 'scanned'],
  recording: ['evidence_ready', 'failed'],
  evidence_ready: ['dispatched', 'failed'],
  dispatched: ['shipped', 'claimed', 'returned'],
  shipped: ['closed', 'claimed', 'returned'],
  claimed: ['closed'],
  returned: ['closed'],
  failed: ['queued'],
  exception: ['queued', 'closed'],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.order.findMany({
      where: tenantWhere(companyId),
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getOne(companyId: string, id: string) {
    const o = await this.prisma.order.findFirst({
      where: tenantWhere(companyId, { id }),
      include: { items: true },
    });
    if (!o) throw new NotFoundException('Order not found');
    return o;
  }

  async transition(
    companyId: string,
    id: string,
    toStatus: string,
    extra: Record<string, unknown> = {},
  ) {
    const order = await this.getOne(companyId, id);
    const from = String(order.status || '').toLowerCase();
    const to = toStatus.toLowerCase();
    const allowed = ALLOWED[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Cannot transition ${from} → ${to}`);
    }
    return this.prisma.order.update({
      where: { id },
      data: {
        status: to as OrderStatus,
        ...extra,
      } as any,
    });
  }

  async dispatch(companyId: string, id: string, awb: string) {
    if (!awb?.trim()) throw new BadRequestException('AWB required');
    return this.transition(companyId, id, 'dispatched', {
      awb: awb.trim(),
      dispatchedAt: new Date(),
    });
  }

  async markShipped(companyId: string, id: string) {
    return this.transition(companyId, id, 'shipped', {
      shippedAt: new Date(),
    });
  }
}
