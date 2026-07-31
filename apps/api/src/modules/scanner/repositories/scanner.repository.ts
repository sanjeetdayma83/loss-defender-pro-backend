import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  Scanner,
  ScanStatus,
} from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

import { CreateScannerDto } from '../dto/create-scanner.dto';
import { UpdateScannerDto } from '../dto/update-scanner.dto';
import { ScannerQueryDto } from '../dto/scanner-query.dto';

@Injectable()
export class ScannerRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * -------------------------------------------------------
   * BUILD WHERE
   * -------------------------------------------------------
   */

  private buildWhere(
    query: ScannerQueryDto,
  ): Prisma.ScannerWhereInput {
    const where: Prisma.ScannerWhereInput = {
      isDeleted: false,
    };

    if (query.orderId) {
      where.orderId = query.orderId;
    }

    if (query.warehouseId) {
      where.warehouseId = query.warehouseId;
    }

    if (query.sessionId) {
      where.sessionId = query.sessionId;
    }

    if (query.status) {
  where.status = query.status as ScanStatus;
}

    if (query.search) {
      where.OR = [
        {
          barcode: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          orderId: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          sessionId: {
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
    dto: CreateScannerDto,
  ): Promise<Scanner> {
    return this.prisma.scanner.create({
  data: dto as unknown as Prisma.ScannerCreateInput,
});
  }

  /**
   * -------------------------------------------------------
   * FIND BY ID
   * -------------------------------------------------------
   */

  async findById(
    id: string,
  ): Promise<Scanner> {
    const scanner =
      await this.prisma.scanner.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    if (!scanner) {
      throw new NotFoundException(
        `Scanner record ${id} not found.`,
      );
    }

    return scanner;
  }

  /**
   * -------------------------------------------------------
   * FIND ALL
   * -------------------------------------------------------
   */

  async findAll(
    query: ScannerQueryDto,
  ) {
    const where =
      this.buildWhere(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] =
      await this.prisma.$transaction([
        this.prisma.scanner.findMany({
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
        this.prisma.scanner.count({
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
    dto: UpdateScannerDto,
  ): Promise<Scanner> {
    await this.findById(id);

    return this.prisma.scanner.update({
      where: { id },
      data:
        dto as Prisma.ScannerUpdateInput,
    });
  }

  /**
   * -------------------------------------------------------
   * SOFT DELETE
   * -------------------------------------------------------
   */

  async softDelete(
    id: string,
  ): Promise<Scanner> {
    await this.findById(id);

    return this.prisma.scanner.update({
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
  ): Promise<Scanner> {
    return this.prisma.scanner.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * BARCODE
   * -------------------------------------------------------
   */

  async findByBarcode(
    barcode: string,
  ): Promise<Scanner | null> {
    return this.prisma.scanner.findFirst({
      where: {
        barcode,
        isDeleted: false,
      },
    });
  }

  async barcodeExists(
    barcode: string,
  ): Promise<boolean> {
    return (
      await this.prisma.scanner.count({
        where: {
          barcode,
          isDeleted: false,
        },
      })
    ) > 0;
  }

  /**
   * -------------------------------------------------------
   * DUPLICATE SCAN
   * -------------------------------------------------------
   */

  async isDuplicateScan(
    barcode: string,
    orderId: string,
  ): Promise<boolean> {
    return (
      await this.prisma.scanner.count({
        where: {
          barcode,
          orderId,
          isDeleted: false,
        },
      })
    ) > 0;
  }

  /**
   * -------------------------------------------------------
   * SESSION
   * -------------------------------------------------------
   */

  async findBySession(
    sessionId: string,
  ): Promise<Scanner[]> {
    return this.prisma.scanner.findMany({
      where: {
        sessionId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByOrder(
    orderId: string,
  ): Promise<Scanner[]> {
    return this.prisma.scanner.findMany({
      where: {
        orderId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByWarehouse(
    warehouseId: string,
  ): Promise<Scanner[]> {
    return this.prisma.scanner.findMany({
      where: {
        warehouseId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
    /**
   * -------------------------------------------------------
   * VERIFICATION
   * -------------------------------------------------------
   */

  async verifyScan(
    id: string,
    verifiedBy: string,
  ): Promise<Scanner> {
    await this.findById(id);

    return this.prisma.scanner.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  async markFailed(
    id: string,
    remarks?: string,
  ): Promise<Scanner> {
    await this.findById(id);

    return this.prisma.scanner.update({
      where: { id },
      data: {
        status: 'FAILED',
        remarks,
      },
    });
  }

  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics() {
    const [
      totalScans,
      verifiedScans,
      failedScans,
      duplicateScans,
    ] = await this.prisma.$transaction([
      this.prisma.scanner.count({
        where: {
          isDeleted: false,
        },
      }),
      this.prisma.scanner.count({
        where: {
          status: 'VERIFIED',
          isDeleted: false,
        },
      }),
      this.prisma.scanner.count({
        where: {
          status: 'FAILED',
          isDeleted: false,
        },
      }),
      this.prisma.scanner.count({
        where: {
          status: 'DUPLICATE',
          isDeleted: false,
        },
      }),
    ]);

    return {
      totalScans,
      verifiedScans,
      failedScans,
      duplicateScans,
    };
  }

  async getSessionStatistics(
    sessionId: string,
  ) {
    const scans =
      await this.findBySession(sessionId);

    return {
      sessionId,
      totalScans: scans.length,
      verifiedScans: scans.filter(
        (s) => s.status === 'VERIFIED',
      ).length,
      failedScans: scans.filter(
        (s) => s.status === 'FAILED',
      ).length,
      duplicateScans: scans.filter(
        (s) => s.status === 'DUPLICATE',
      ).length,
    };
  }

  /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkDelete(
    ids: string[],
  ) {
    return this.prisma.scanner.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async bulkVerify(
    ids: string[],
    verifiedBy: string,
  ) {
    return this.prisma.scanner.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
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
      module: 'ScannerRepository',
      status: 'OK',
      timestamp: new Date(),
    };
  }

  /**
   * -------------------------------------------------------
   * GENERIC HELPERS
   * -------------------------------------------------------
   */

  count(
    where?: Prisma.ScannerWhereInput,
  ) {
    return this.prisma.scanner.count({
      where,
    });
  }

  findMany(
    args: Prisma.ScannerFindManyArgs,
  ) {
    return this.prisma.scanner.findMany(
      args,
    );
  }

  findFirst(
    args: Prisma.ScannerFindFirstArgs,
  ) {
    return this.prisma.scanner.findFirst(
      args,
    );
  }

  createMany(
    args: Prisma.ScannerCreateManyArgs,
  ) {
    return this.prisma.scanner.createMany(
      args,
    );
  }

  upsert(
    args: Prisma.ScannerUpsertArgs,
  ) {
    return this.prisma.scanner.upsert(
      args,
    );
  }

  delete(id: string) {
    return this.prisma.scanner.delete({
      where: {
        id,
      },
    });
  }

  transaction<T>(
    callback: (
      tx: Prisma.TransactionClient,
    ) => Promise<T>,
  ) {
    return this.prisma.$transaction(
      callback,
    );
  }
}