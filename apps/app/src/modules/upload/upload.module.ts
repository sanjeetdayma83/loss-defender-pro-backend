import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './controllers/upload.controller';
import { UploadRepository } from './repositories/upload.repository';
import { UploadService } from './services/upload.service';
import { StorageFactory } from './storage/storage.factory';
import { StorageService } from './storage/storage.service';
import { LocalStorage } from './storage/local.storage';
import { S3Storage } from './storage/s3.storage';
import { MinioStorage } from './storage/minio.storage';
import { UploadStateMachine } from './utils/upload-state-machine';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [
    UploadRepository,
    UploadService,
    UploadStateMachine,
    LocalStorage,
    S3Storage,
    MinioStorage,
    StorageFactory,
  ],
  exports: [UploadService, StorageService, UploadRepository],
})
export class UploadModule {}
