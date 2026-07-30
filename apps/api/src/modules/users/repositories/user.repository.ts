import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  User,
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

  /**
   * -------------------------------------------------------
   * BUILD WHERE
   * -------------------------------------------------------
   */

  private buildWhere(
    query: UserQueryDto,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
    };

    if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
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

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(
    dto: CreateUserDto,
  ): Promise<User> {
    return this.prisma.user.create({
      data:
        dto as Prisma.UserCreateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<User> {
    const user =
      await this.prisma.user.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${id} not found.`,
      );
    }

    return user;
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(
    query: UserQueryDto,
  ) {
    const where =
      this.buildWhere(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] =
      await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: {
            [query.sortBy ??
              'createdAt']:
              query.sortOrder ??
              'desc',
          },
        }),
        this.prisma.user.count({
          where,
        }),
      ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit,
      ),
    };
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data:
        dto as Prisma.UserUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * SOFT DELETE
   * -------------------------------------------------------
   */

  async softDelete(
    id: string,
  ): Promise<User> {
    await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * RESTORE
   * -------------------------------------------------------
   */

  async restore(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * ACTIVATE
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * DEACTIVATE
   * -------------------------------------------------------
   */

  async deactivate(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  /**
   * -------------------------------------------------------
   * FINDERS
   * -------------------------------------------------------
   */

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        isDeleted: false,
      },
    });
  }

  async findByUsername(
    username: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username,
        isDeleted: false,
      },
    });
  }

  async findByEmployeeCode(
    employeeCode: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        employeeCode,
        isDeleted: false,
      },
    });
  }

  async findByCompany(
    companyId: string,
  ): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      orderBy: {
        username: 'asc',
      },
    });
  }
    /**
   * -------------------------------------------------------
   * WAREHOUSE ASSIGNMENT
   * -------------------------------------------------------
   */

  async findByWarehouse(
    warehouseId: string,
  ): Promise<User[]> {
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

  /**
   * -------------------------------------------------------
   * LOGIN / PASSWORD
   * -------------------------------------------------------
   */

  async updateLastLogin(
    id: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }

  async updatePassword(
    id: string,
    password: string,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        password,
        passwordChangedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(
    id: string,
  ) {
    const user = await this.findById(id);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin,
      statistics: user.statistics,
    };
  }

  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkActivate(
    ids: string[],
  ) {
    return this.prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  async bulkDeactivate(
    ids: string[],
  ) {
    return this.prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        status: 'INACTIVE',
      },
    });
  }

  async bulkDelete(
    ids: string[],
  ) {
    return this.prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   */

  async existsByEmail(
    email: string,
  ): Promise<boolean> {
    return (
      await this.prisma.user.count({
        where: {
          email,
          isDeleted: false,
        },
      })
    ) > 0;
  }

  async existsByUsername(
    username: string,
  ): Promise<boolean> {
    return (
      await this.prisma.user.count({
        where: {
          username,
          isDeleted: false,
        },
      })
    ) > 0;
  }

  async existsByEmployeeCode(
    employeeCode: string,
  ): Promise<boolean> {
    return (
      await this.prisma.user.count({
        where: {
          employeeCode,
          isDeleted: false,
        },
      })
    ) > 0;
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

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

  /**
   * -------------------------------------------------------
   * GENERIC HELPERS
   * -------------------------------------------------------
   */

  count(where?: Prisma.UserWhereInput) {
    return this.prisma.user.count({
      where,
    });
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
    return this.prisma.user.delete({
      where: { id },
    });
  }

  transaction<T>(
    callback: (
      tx: Prisma.TransactionClient,
    ) => Promise<T>,
  ) {
    return this.prisma.$transaction(callback);
  }
}