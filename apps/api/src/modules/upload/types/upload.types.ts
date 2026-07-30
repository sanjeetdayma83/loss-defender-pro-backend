import { UploadStatus } from '@prisma/client';

export type StorageProvider =
  | 'local'
  | 's3'
  | 'minio';

export type UploadVisibility =
  | 'private'
  | 'public';

export type UploadCategory =
  | 'recording'
  | 'thumbnail'
  | 'evidence'
  | 'report'
  | 'document'
  | 'avatar'
  | 'other';

export interface UploadMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  fps?: number;
  codec?: string;
  deviceModel?: string;
  cameraName?: string;
  checksum?: string;
  hash?: string;
  [key: string]: unknown;
}

export interface UploadSession {
  uploadId: string;
  key: string;
  provider: StorageProvider;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number;
  expiresAt: Date;
}

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  provider: StorageProvider;
  key: string;
  url: string;
  etag?: string;
  checksum?: string;
  size: number;
  mimeType: string;
  status: UploadStatus;
}

export interface PresignedUrlResult {
  url: string;
  expiresIn: number;
}

export interface ChunkUploadResult {
  partNumber: number;
  etag: string;
}

export interface CompletedMultipartUpload {
  url: string;
  key: string;
  etag: string;
}