import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(companyId: string, id: string) {
    const ev = await this.prisma.evidence.findFirst({
      where: { id, companyId },
      include: {
        frames: { orderBy: { sequence: 'asc' } },
        recording: {
          select: {
            id: true,
            status: true,
            durationSec: true,
            startedAt: true,
            completedAt: true,
            operator: { select: { id: true, name: true } },
          },
        },
        order: {
          select: { id: true, marketplaceOrderId: true, status: true },
        },
      },
    });
    if (!ev) throw new NotFoundException('Evidence not found');
    return ev;
  }

  async list(companyId: string, orderId?: string) {
    return this.prisma.evidence.findMany({
      where: {
        companyId,
        ...(orderId ? { orderId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        recording: { select: { id: true, status: true, durationSec: true } },
        order: { select: { id: true, marketplaceOrderId: true } },
      },
      take: 50,
    });
  }
}