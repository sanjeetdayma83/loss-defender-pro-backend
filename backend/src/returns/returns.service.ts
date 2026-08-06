import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { ReturnStatus } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, dto: CreateReturnDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, companyId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.return.create({
      data: {
        companyId,
        orderId: dto.orderId,
        reason: dto.reason,
      },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
  }

  async list(companyId: string, status?: string) {
    return this.prisma.return.findMany({
      where: {
        companyId,
        ...(status ? { status: status as ReturnStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
      take: 50,
    });
  }

  async findOne(companyId: string, id: string) {
    const r = await this.prisma.return.findFirst({
      where: { id, companyId },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
    if (!r) throw new NotFoundException('Return not found');
    return r;
  }

  async update(companyId: string, id: string, dto: UpdateReturnDto) {
    await this.findOne(companyId, id);
    return this.prisma.return.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status as ReturnStatus } : {}),
        ...(dto.conditionNote !== undefined ? { conditionNote: dto.conditionNote } : {}),
        ...(dto.decision !== undefined ? { decision: dto.decision } : {}),
        ...(dto.status === 'closed' ? { closedAt: new Date() } : {}),
      },
      include: {
        order: { select: { id: true, marketplaceOrderId: true, status: true } },
      },
    });
  }
}