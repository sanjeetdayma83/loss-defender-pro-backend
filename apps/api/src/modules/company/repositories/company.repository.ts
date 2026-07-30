import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';

import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.company.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.company.findUnique({
      where: {
        id,
      },
    });
  }

  async findByCode(code: string) {
    return this.prisma.company.findUnique({
      where: {
        code,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.CompanyUpdateInput,
  ) {
    return this.prisma.company.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.company.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}