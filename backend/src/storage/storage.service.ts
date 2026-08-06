import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export type UploadPurpose = "evidence" | "recording" | "profile" | "claim";

@Injectable()
export class StorageService {
  private readonly log = new Logger(StorageService.name);
  private client: S3Client | null = null;
  private bucket: string;
  private ttl: number;
  private configured = false;

  constructor(private readonly config: ConfigService) {
    const keyId = this.config.get<string>("b2.keyId");
    const appKey = this.config.get<string>("b2.appKey");
    const endpoint = this.config.get<string>("b2.endpoint");
    this.bucket = this.config.get<string>("b2.bucket") || "loss-defender-pro-media-dev";
    this.ttl = this.config.get<number>("b2.signedUrlTtl") || 900;

    if (keyId && appKey && endpoint) {
      this.client = new S3Client({
        endpoint,
        region: "us-west-002",
        credentials: { accessKeyId: keyId, secretAccessKey: appKey },
        forcePathStyle: true,
      });
      this.configured = true;
      this.log.log(`B2 storage configured → bucket=${this.bucket}`);
    } else {
      this.log.warn("B2 keys missing — storage endpoints will return 503 until .env is set");
    }
  }

  private ensure() {
    if (!this.configured || !this.client) {
      throw new BadRequestException(
        "Storage not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_ENDPOINT in .env",
      );
    }
  }

  /** Key layout: companyId/purpose/yyyy/mm/uuid.ext */
  buildKey(companyId: string, purpose: UploadPurpose, filename: string): string {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${companyId}/${purpose}/${yyyy}/${mm}/${randomUUID()}-${safe}`;
  }

  async getUploadUrl(opts: {
    companyId: string;
    purpose: UploadPurpose;
    filename: string;
    contentType: string;
  }) {
    this.ensure();
    const key = this.buildKey(opts.companyId, opts.purpose, opts.filename);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: opts.contentType,
    });
    const uploadUrl = await getSignedUrl(this.client!, command, { expiresIn: this.ttl });
    return {
      key,
      uploadUrl,
      publicUrl: null as string | null, // always private
      expiresIn: this.ttl,
      bucket: this.bucket,
    };
  }

  async getDownloadUrl(key: string) {
    this.ensure();
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const downloadUrl = await getSignedUrl(this.client!, command, { expiresIn: this.ttl });
    return { key, downloadUrl, expiresIn: this.ttl };
  }

  async head(key: string) {
    this.ensure();
    try {
      const res = await this.client!.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        key,
        contentType: res.ContentType,
        contentLength: res.ContentLength,
        etag: res.ETag,
        lastModified: res.LastModified,
      };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    this.ensure();
    await this.client!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    return { deleted: true, key };
  }

  isConfigured() {
    return this.configured;
  }
}