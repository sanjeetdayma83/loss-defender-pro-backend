import {
  Injectable,
} from '@nestjs/common';

import {
  Claim,
  ClaimPriority,
  ClaimResolutionType,
  ClaimStatus,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';
import { CreateClaimDto } from '../dto/create-claim.dto';
import { UpdateClaimDto } from '../dto/update-claim.dto';
import { ClaimQueryDto } from '../dto/claim-query.dto';

@Injectable()
export class ClaimRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    data: CreateClaimDto & {
      claimNumber: string;
    },
  ): Promise<Claim> {
    return this.prisma.claim.create({
      data,
    });
  }

  async findById(
    id: string,
  ): Promise<Claim | null> {
    return this.prisma.claim.findUnique({
      where: {
        id,
      },
    });
  }

  async findByClaimNumber(
    claimNumber: string,
  ): Promise<Claim | null> {
    return this.prisma.claim.findUnique({
      where: {
        claimNumber,
      },
    });
  }

  async update(
    id: string,
    data: UpdateClaimDto,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: ClaimStatus,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async updatePriority(
    id: string,
    priority: ClaimPriority,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        priority,
      },
    });
  }

  async assign(
    id: string,
    assignedTo: string,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        assignedTo,
      },
    });
  }

  async resolve(
    id: string,
    resolutionType: ClaimResolutionType,
    resolvedBy: string,
    resolutionData?: Prisma.JsonValue,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        status: ClaimStatus.RESOLVED,
        resolutionType,
        resolvedBy,
        resolvedAt: new Date(),
        resolutionData,
      },
    });
  }

  async close(
    id: string,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        status: ClaimStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  async softDelete(
    id: string,
  ): Promise<Claim> {
    return this.prisma.claim.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async count(
    where: Prisma.ClaimWhereInput = {},
  ): Promise<number> {
    return this.prisma.claim.count({
      where,
    });
  }

  async findAll(
    query: ClaimQueryDto,
  ) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      ...filters
    } = query;

    const where: Prisma.ClaimWhereInput = {
      isDeleted: false,
      ...filters,
    };

    if (search) {
      where.OR = [
        {
          claimNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return this.prisma.claim.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  async statistics() {
    const [
      total,
      open,
      resolved,
      closed,
      cancelled,
    ] = await Promise.all([
      this.prisma.claim.count({
        where: {
          isDeleted: false,
        },
      }),
      this.prisma.claim.count({
        where: {
          status: ClaimStatus.OPEN,
          isDeleted: false,
        },
      }),
      this.prisma.claim.count({
        where: {
          status: ClaimStatus.RESOLVED,
          isDeleted: false,
        },
      }),
      this.prisma.claim.count({
        where: {
          status: ClaimStatus.CLOSED,
          isDeleted: false,
        },
      }),
      this.prisma.claim.count({
        where: {
          status: ClaimStatus.CANCELLED,
          isDeleted: false,
        },
      }),
    ]);

    return {
      total,
      open,
      resolved,
      closed,
      cancelled,
    };
  }
}