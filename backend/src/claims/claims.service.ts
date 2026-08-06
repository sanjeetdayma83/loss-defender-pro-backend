import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimStatus } from '@prisma/client';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateClaimDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, companyId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.claim.create({
      data: {
        companyId,
        orderId: dto.orderId,
        reason: dto.reason,
        marketplace: dto.marketplace,
        description: dto.description,
        evidenceIds: dto.evidenceIds ?? [],
      },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
  }

  async list(companyId: string, status?: string) {
    return this.prisma.claim.findMany({
      where: {
        companyId,
        ...(status ? { status: status as ClaimStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
      take: 50,
    });
  }

  async findOne(companyId: string, id: string) {
    const c = await this.prisma.claim.findFirst({
      where: { id, companyId },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
    if (!c) throw new NotFoundException('Claim not found');
    return c;
  }

  async update(companyId: string, id: string, dto: UpdateClaimDto) {
    await this.findOne(companyId, id);
    return this.prisma.claim.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status as ClaimStatus } : {}),
        ...(dto.decisionNote !== undefined ? { decisionNote: dto.decisionNote } : {}),
        ...(dto.status === 'closed' ? { closedAt: new Date() } : {}),
      },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
  }
}