import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../database/prisma.service';

import {
  Prisma,
  User,
} from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(data: {
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(
    id: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByEmailActive(
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
  id: string,
  data: Prisma.UserUncheckedUpdateInput,
): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateRefreshToken(
    id: string,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  async updateLastLogin(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async softDelete(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
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