import {
  CompletedMultipartUpload,
  ChunkUploadResult,
  PresignedUrlResult,
  StorageProvider,
  UploadMetadata,
  UploadResult,
  UploadSession,
} from '../types/upload.types';

export interface IStorageProvider {
  readonly provider: StorageProvider;

  upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
    metadata?: UploadMetadata,
  ): Promise<UploadResult>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  getUrl(key: string): Promise<string>;

  generatePresignedUploadUrl(
    key: string,
    expiresIn?: number,
  ): Promise<PresignedUrlResult>;

  generatePresignedDownloadUrl(
    key: string,
    expiresIn?: number,
  ): Promise<PresignedUrlResult>;

  initiateMultipartUpload(
    key: string,
    mimeType: string,
    metadata?: UploadMetadata,
  ): Promise<UploadSession>;

  uploadPart(
    uploadId: string,
    key: string,
    partNumber: number,
    buffer: Buffer,
  ): Promise<ChunkUploadResult>;

  completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: ChunkUploadResult[],
  ): Promise<CompletedMultipartUpload>;

  abortMultipartUpload(uploadId: string, key: string): Promise<void>;
}
