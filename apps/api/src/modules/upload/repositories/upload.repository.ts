import { Injectable } from '@nestjs/common';
import { Prisma, Upload } from '@prisma/client';

import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class UploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UploadCreateInput): Promise<Upload> {
    return this.prisma.upload.create({
      data,
    });
  }

  async findById(id: string): Promise<Upload | null> {
    return this.prisma.upload.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(args?: Prisma.UploadFindManyArgs): Promise<Upload[]> {
    return this.prisma.upload.findMany(args);
  }

  async update(id: string, data: Prisma.UploadUpdateInput): Promise<Upload> {
    return this.prisma.upload.update({
      where: {
        id,
      },
      data,
    });
  }

  async softDelete(id: string): Promise<Upload> {
    return this.prisma.upload.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<Upload> {
    return this.prisma.upload.delete({
      where: {
        id,
      },
    });
  }

  async count(where?: Prisma.UploadWhereInput): Promise<number> {
    return this.prisma.upload.count({
      where,
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.upload.count({
      where: {
        id,
        isDeleted: false,
      },
    });

    return count > 0;
  }

  async findByStorageKey(storageKey: string): Promise<Upload | null> {
    return this.prisma.upload.findFirst({
      where: {
        storageKey,
        isDeleted: false,
      },
    });
  }

  async findByChecksum(checksum: string): Promise<Upload | null> {
    return this.prisma.upload.findFirst({
      where: {
        checksum,
        isDeleted: false,
      },
    });
  }

  async markUploaded(id: string, etag: string, size: bigint): Promise<Upload> {
    return this.prisma.upload.update({
      where: {
        id,
      },
      data: {
        status: 'UPLOADED',
        etag,
        size,
        uploadedAt: new Date(),
      },
    });
  }
}
