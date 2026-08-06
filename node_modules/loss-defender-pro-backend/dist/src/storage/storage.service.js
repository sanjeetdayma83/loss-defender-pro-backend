"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = require("crypto");
let StorageService = StorageService_1 = class StorageService {
    constructor(config) {
        this.config = config;
        this.log = new common_1.Logger(StorageService_1.name);
        this.client = null;
        this.configured = false;
        const keyId = this.config.get("b2.keyId");
        const appKey = this.config.get("b2.appKey");
        const endpoint = this.config.get("b2.endpoint");
        this.bucket = this.config.get("b2.bucket") || "loss-defender-pro-media-dev";
        this.ttl = this.config.get("b2.signedUrlTtl") || 900;
        if (keyId && appKey && endpoint) {
            this.client = new client_s3_1.S3Client({
                endpoint,
                region: "us-west-002",
                credentials: { accessKeyId: keyId, secretAccessKey: appKey },
                forcePathStyle: true,
            });
            this.configured = true;
            this.log.log(`B2 storage configured → bucket=${this.bucket}`);
        }
        else {
            this.log.warn("B2 keys missing — storage endpoints will return 503 until .env is set");
        }
    }
    ensure() {
        if (!this.configured || !this.client) {
            throw new common_1.BadRequestException("Storage not configured. Set B2_KEY_ID, B2_APPLICATION_KEY, B2_ENDPOINT in .env");
        }
    }
    buildKey(companyId, purpose, filename) {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
        const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
        return `${companyId}/${purpose}/${yyyy}/${mm}/${(0, crypto_1.randomUUID)()}-${safe}`;
    }
    async getUploadUrl(opts) {
        this.ensure();
        const key = this.buildKey(opts.companyId, opts.purpose, opts.filename);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: opts.contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: this.ttl });
        return {
            key,
            uploadUrl,
            publicUrl: null,
            expiresIn: this.ttl,
            bucket: this.bucket,
        };
    }
    async getDownloadUrl(key) {
        this.ensure();
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: this.ttl });
        return { key, downloadUrl, expiresIn: this.ttl };
    }
    async head(key) {
        this.ensure();
        try {
            const res = await this.client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucket, Key: key }));
            return {
                key,
                contentType: res.ContentType,
                contentLength: res.ContentLength,
                etag: res.ETag,
                lastModified: res.LastModified,
            };
        }
        catch {
            return null;
        }
    }
    async delete(key) {
        this.ensure();
        await this.client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
        return { deleted: true, key };
    }
    isConfigured() {
        return this.configured;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map