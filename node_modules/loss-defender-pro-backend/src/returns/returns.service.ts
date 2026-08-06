import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ALLOWED: Record<string, string[]> = {
  requested: ['received', 'rejected', 'closed'],
  received: ['inspecting', 'rejected', 'closed'],
  inspecting: ['refunded', 'restocked', 'rejected', 'closed'],
  refunded: ['closed'],
  restocked: ['closed'],
  rejected: ['closed'],
  closed: [],
};

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.return.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(companyId: string, actorId: string, data: { orderId: string; reason?: string; notes?: string }) {
    const o = await this.prisma.order.findFirst({ where: { id: data.orderId, companyId } });
    if (!o) throw new NotFoundException('Order not found');

    const row = await this.prisma.return.create({
      data: {
        companyId,
        orderId: data.orderId,
        reason: data.reason ?? 'customer_return',
        status: 'requested',
        conditionNote: data.notes,
      },
    });

    await this.writeAudit(companyId, actorId, 'return.create', 'Return', row.id, { orderId: data.orderId });
    return row;
  }

  async updateStatus(companyId: string, actorId: string, id: string, status: string) {
    const row = await this.prisma.return.findFirst({ where: { id, companyId } });
    if (!row) throw new NotFoundException('Return not found');

    const cur = row.status as string;
    const next = ALLOWED[cur] || [];
    if (!next.includes(status)) {
      throw new BadRequestException(`Cannot transition ${cur} → ${status}. Allowed: ${next.join(', ') || 'none'}`);
    }

    const data: any = { status };
    if (status === 'closed') data.closedAt = new Date();

    const updated = await this.prisma.return.update({ where: { id }, data });

    await this.writeAudit(companyId, actorId, 'return.status', 'Return', id, { from: cur, to: status });
    return updated;
  }

  private async writeAudit(companyId: string, actorId: string, action: string, entity: string, entityId: string, meta?: any) {
    try {
      await this.prisma.auditLog.create({
        data: { companyId, actorId, action, entity, entityId, meta: meta ?? {} } as any,
      });
    } catch (_) {}
  }
}
