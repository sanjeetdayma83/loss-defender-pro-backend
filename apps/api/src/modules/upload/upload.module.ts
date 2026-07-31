import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { UploadController } from './controllers/upload.controller';
import { UploadRepository } from './repositories/upload.repository';
import { UploadService } from './services/upload.service';

import { StorageFactory } from './storage/storage.factory';
import { StorageService } from './storage/storage.service';
import { LocalStorage } from './storage/local.storage';
import { S3Storage } from './storage/s3.storage';
import { MinioStorage } from './storage/minio.storage';
import { ConfigModule } from '@nestjs/config';
import { UploadStateMachine } from './utils/upload-state-machine';

@Module({
  imports: [ConfigModule],

  controllers: [UploadController],
  providers: [
    PrismaService,

    UploadRepository,
    UploadService,

    UploadStateMachine,

    StorageFactory,
    StorageService,

    LocalStorage,
    S3Storage,
    MinioStorage,
  ],
  exports: [UploadService, StorageService, UploadRepository],
})
export class UploadModule {}
