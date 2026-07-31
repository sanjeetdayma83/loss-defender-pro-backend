import { Injectable } from '@nestjs/common';
import { Evidence, Prisma } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EvidenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.EvidenceCreateInput): Promise<Evidence> {
    return this.prisma.evidence.create({
      data,
    });
  }

  async findById(id: string): Promise<Evidence | null> {
    return this.prisma.evidence.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(args?: Prisma.EvidenceFindManyArgs): Promise<Evidence[]> {
    return this.prisma.evidence.findMany(args);
  }

  async update(
    id: string,
    data: Prisma.EvidenceUpdateInput,
  ): Promise<Evidence> {
    return this.prisma.evidence.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string): Promise<Evidence> {
    return this.prisma.evidence.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async count(where?: Prisma.EvidenceWhereInput): Promise<number> {
    return this.prisma.evidence.count({
      where,
    });
  }
}
