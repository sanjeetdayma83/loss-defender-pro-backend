import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Upload, UploadStatus, UploadVisibility } from '@prisma/client';

import { CreateUploadDto } from '../dto/create-upload.dto';
import { UpdateUploadDto } from '../dto/update-upload.dto';
import { UploadQueryDto } from '../dto/upload-query.dto';

import { UploadRepository } from '../repositories/upload.repository';

import { StorageService } from '../storage/storage.service';

import { UploadStateMachine } from '../utils/upload-state-machine';

@Injectable()
export class UploadService {
  constructor(
    private readonly uploadRepository: UploadRepository,
    private readonly storageService: StorageService,
    private readonly stateMachine: UploadStateMachine,
  ) {}

  async create(dto: CreateUploadDto): Promise<Upload> {
    return this.uploadRepository.create({
      company: {
        connect: {
          id: dto.companyId,
        },
      },

      warehouse: {
        connect: {
          id: dto.warehouseId,
        },
      },

      ...(dto.orderId && {
        order: {
          connect: {
            id: dto.orderId,
          },
        },
      }),

      ...(dto.recordingId && {
        recording: {
          connect: {
            id: dto.recordingId,
          },
        },
      }),

      ...(dto.evidenceId && {
        evidence: {
          connect: {
            id: dto.evidenceId,
          },
        },
      }),

      originalName: dto.originalName,
      fileName: dto.fileName,
      storageKey: dto.storageKey,
      bucket: dto.bucket,
      provider: dto.provider,
      mimeType: dto.mimeType,
      extension: dto.extension,
      checksum: dto.checksum,
      hash: dto.hash,

      category: dto.category,

      visibility: dto.visibility ?? UploadVisibility.PRIVATE,

      metadata: dto.metadata as Prisma.InputJsonValue,

      status: UploadStatus.PENDING,
    });
  }

  async findById(id: string): Promise<Upload> {
    const upload = await this.uploadRepository.findById(id);

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    return upload;
  }

  async findAll(query: UploadQueryDto): Promise<Upload[]> {
    return this.uploadRepository.findAll({
      where: {
        companyId: query.companyId,
        warehouseId: query.warehouseId,
        orderId: query.orderId,
        recordingId: query.recordingId,
        evidenceId: query.evidenceId,
        category: query.category,
        status: query.status,
        visibility: query.visibility,
        provider: query.provider,
        isDeleted: false,
      },

      skip: (query.page - 1) * query.limit,

      take: query.limit,

      orderBy: {
        [query.sortBy]: query.sortOrder,
      },
    });
  }

  async update(id: string, dto: UpdateUploadDto): Promise<Upload> {
    await this.findById(id);

    return this.uploadRepository.update(id, {
      ...dto,
      metadata: dto.metadata as Prisma.InputJsonValue,
    });
  }

  async delete(id: string): Promise<Upload> {
    await this.findById(id);

    return this.uploadRepository.softDelete(id);
  }

  async changeStatus(id: string, status: UploadStatus): Promise<Upload> {
    const upload = await this.findById(id);

    this.stateMachine.validateTransition(upload.status, status);

    return this.uploadRepository.update(id, {
      status,
    });
  }

  async uploadCompleted(
    id: string,
    etag: string,
    size: bigint,
  ): Promise<Upload> {
    await this.findById(id);

    return this.uploadRepository.markUploaded(id, etag, size);
  }

  async generateUploadUrl(key: string) {
    return this.storageService.generateUploadUrl(key);
  }

  async generateDownloadUrl(key: string) {
    return this.storageService.generateDownloadUrl(key);
  }

  async deletePhysicalFile(key: string): Promise<void> {
    return this.storageService.delete(key);
  }

  async fileExists(key: string): Promise<boolean> {
    return this.storageService.exists(key);
  }

  async getFileUrl(key: string): Promise<string> {
    return this.storageService.getUrl(key);
  }

  async markUploading(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.UPLOADING);
  }

  async markUploaded(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.UPLOADED);
  }

  async markProcessing(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.PROCESSING);
  }

  async markCompleted(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.COMPLETED);
  }

  async markFailed(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.FAILED);
  }

  async cancel(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.CANCELLED);
  }

  async restore(id: string): Promise<Upload> {
    return this.changeStatus(id, UploadStatus.UPLOADING);
  }
}
