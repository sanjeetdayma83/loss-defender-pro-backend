import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId: string) {
    return this.prisma.claim.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(
    companyId: string,
    actorId: string,
    data: {
      orderId?: string;
      title: string;
      reason?: string;
      amount?: number;
    },
  ) {
    if (data.orderId) {
      const o = await this.prisma.order.findFirst({
        where: { id: data.orderId, companyId },
      });
      if (!o) throw new NotFoundException('Order not found');
    }

    const attempts: any[] = [
      {
        companyId,
        orderId: data.orderId,
        title: data.title,
        reason: data.reason ?? data.title,
        amount: data.amount,
        status: 'open',
        createdById: actorId,
      },
      {
        companyId,
        orderId: data.orderId,
        title: data.title,
        reason: data.reason ?? data.title,
        status: 'open',
      },
      {
        companyId,
        orderId: data.orderId,
        reason: data.reason ?? data.title,
        status: 'open',
      },
    ];

    let last: unknown;
    for (const row of attempts) {
      try {
        return await this.prisma.claim.create({ data: row });
      } catch (e) {
        last = e;
      }
    }
    throw new NotFoundException(
      `Claim create failed: ${(last as any)?.message ?? last}`,
    );
  }

  async updateStatus(companyId: string, id: string, status: string) {
    const c = await this.prisma.claim.findFirst({ where: { id, companyId } });
    if (!c) throw new NotFoundException('Claim not found');
    return this.prisma.claim.update({
      where: { id },
      data: { status } as any,
    });
  }
}
