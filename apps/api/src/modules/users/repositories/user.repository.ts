import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  User,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private buildWhere(query: UserQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.role) {
      where.role = query.role as UserRole;
    }

    if (query.status) {
      where.status = query.status as UserStatus;
    }

    if (query.search) {
      where.OR = [
        {
          username: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          employeeCode: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  async create(dto: CreateUserDto): Promise<User> {
  const profile = dto.profile as {
    firstName?: string;
    lastName?: string;
  };

  const data: Prisma.UserUncheckedCreateInput = {
    companyId: dto.companyId,
    email: dto.email,
    username: dto.username,
    employeeCode: dto.employeeCode,
    passwordHash: dto.password,
    role: dto.role as UserRole,

    firstName: profile.firstName ?? 'User',
    lastName: profile.lastName ?? '',

    profile: dto.profile as unknown as Prisma.InputJsonValue,
    assignment:
      dto.assignment as unknown as Prisma.InputJsonValue,
    permissions:
      dto.permissions as unknown as Prisma.InputJsonValue,

    emailVerified: dto.emailVerified ?? false,
    phoneVerified: dto.phoneVerified ?? false,
    twoFactorEnabled:
      dto.twoFactorEnabled ?? false,
  };

  return this.prisma.user.create({
    data,
  });
}

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found.`);
    }

    return user;
  }

  async findAll(query: UserQueryDto) {
    const where = this.buildWhere(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    const data: Prisma.UserUncheckedUpdateInput = {};

    if (dto.email !== undefined) data.email = dto.email;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.employeeCode !== undefined) data.employeeCode = dto.employeeCode;
    if (dto.role !== undefined) data.role = dto.role as UserRole;
    if (dto.password !== undefined) {
      data.passwordHash = dto.password;
      data.passwordChangedAt = new Date();
    }
    if (dto.profile !== undefined) {
      data.profile = dto.profile as unknown as Prisma.InputJsonValue;
      const p = dto.profile as { firstName?: string; lastName?: string };
      if (p.firstName) data.firstName = p.firstName;
      if (p.lastName) data.lastName = p.lastName;
    }
    if (dto.assignment !== undefined) {
      data.assignment = dto.assignment as unknown as Prisma.InputJsonValue;
    }
    if (dto.permissions !== undefined) {
      data.permissions = dto.permissions as unknown as Prisma.InputJsonValue;
    }
    if (dto.emailVerified !== undefined) data.emailVerified = dto.emailVerified;
    if (dto.phoneVerified !== undefined) data.phoneVerified = dto.phoneVerified;
    if (dto.twoFactorEnabled !== undefined) {
      data.twoFactorEnabled = dto.twoFactorEnabled;
    }

    return this.prisma.user.update({
  where: { id },
  data: data as Prisma.UserUncheckedUpdateInput,
});
  }

  async softDelete(id: string): Promise<User> {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async restore(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async activate(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async deactivate(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { username, isDeleted: false },
    });
  }

  async findByEmployeeCode(employeeCode: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { employeeCode, isDeleted: false },
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { username: 'asc' },
    });
  }

  async findByWarehouse(warehouseId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        assignment: {
          path: ['warehouseIds'],
          array_contains: warehouseId,
        },
        isDeleted: false,
      },
    });
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePassword(id: string, password: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: password,
        passwordChangedAt: new Date(),
      },
    });
  }

  async getStatistics(id: string) {
    const user = await this.findById(id);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLoginAt,
      statistics: user.statistics,
    };
  }

  async bulkActivate(ids: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { status: UserStatus.ACTIVE },
    });
  }

  async bulkDeactivate(ids: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { status: UserStatus.INACTIVE },
    });
  }

  async bulkDelete(ids: string[]) {
    return this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (
      (await this.prisma.user.count({
        where: { email, isDeleted: false },
      })) > 0
    );
  }

  async existsByUsername(username: string): Promise<boolean> {
    return (
      (await this.prisma.user.count({
        where: { username, isDeleted: false },
      })) > 0
    );
  }

  async existsByEmployeeCode(employeeCode: string): Promise<boolean> {
    return (
      (await this.prisma.user.count({
        where: { employeeCode, isDeleted: false },
      })) > 0
    );
  }

  async healthCheck(): Promise<boolean> {
    await this.prisma.$queryRaw`SELECT 1`;
    return true;
  }

  async ping() {
    return {
      module: 'UserRepository',
      status: 'OK',
      timestamp: new Date(),
    };
  }

  count(where?: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where });
  }

  findMany(args: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(args);
  }

  findFirst(args: Prisma.UserFindFirstArgs) {
    return this.prisma.user.findFirst(args);
  }

  createMany(args: Prisma.UserCreateManyArgs) {
    return this.prisma.user.createMany(args);
  }

  upsert(args: Prisma.UserUpsertArgs) {
    return this.prisma.user.upsert(args);
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  transaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(callback);
  }
}