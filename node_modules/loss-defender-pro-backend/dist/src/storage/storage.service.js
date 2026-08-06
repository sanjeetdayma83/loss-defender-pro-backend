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
        this.logger = new common_1.Logger(StorageService_1.name);
        this.client = null;
        this.bucket = null;
        this.configured = false;
        const keyId = this.config.get('B2_KEY_ID');
        const appKey = this.config.get('B2_APP_KEY');
        const bucket = this.config.get('B2_BUCKET');
        const endpoint = this.config.get('B2_ENDPOINT');
        const region = this.config.get('B2_REGION') || 'us-west-002';
        if (keyId &&
            appKey &&
            bucket &&
            endpoint &&
            !keyId.includes('PLACE_YOUR') &&
            !appKey.includes('PLACE_YOUR')) {
            this.client = new client_s3_1.S3Client({
                region,
                endpoint,
                credentials: { accessKeyId: keyId, secretAccessKey: appKey },
                forcePathStyle: true,
            });
            this.bucket = bucket;
            this.configured = true;
            this.logger.log(`B2 storage configured bucket=${bucket}`);
        }
        else {
            this.logger.warn('B2 not configured — presign returns configured:false (set .env keys)');
        }
    }
    isConfigured() {
        return this.configured;
    }
    buildKey(companyId, purpose, filename) {
        const now = new Date();
        const y = now.getUTCFullYear();
        const m = String(now.getUTCMonth() + 1).padStart(2, '0');
        const id = (0, crypto_1.randomUUID)();
        const name = filename || id;
        return `${companyId}/${purpose}/${y}/${m}/${name}`;
    }
    recordingSegmentKey(companyId, recordingId, index) {
        return this.buildKey(companyId, 'recordings', `${recordingId}/seg_${index}.webm`);
    }
    evidencePackKey(companyId, evidenceId) {
        return this.buildKey(companyId, 'evidence', `${evidenceId}/pack.json`);
    }
    async presignPut(key, contentType = 'application/octet-stream', expiresIn = 900) {
        if (!this.configured || !this.client || !this.bucket) {
            return {
                configured: false,
                uploadUrl: null,
                key,
                expiresIn,
                message: 'Set B2_KEY_ID, B2_APP_KEY, B2_BUCKET, B2_ENDPOINT in .env',
            };
        }
        const cmd = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, cmd, { expiresIn });
        return { configured: true, uploadUrl, key, expiresIn, contentType };
    }
    async presignGet(key, expiresIn = 900) {
        if (!this.configured || !this.client || !this.bucket) {
            return { configured: false, downloadUrl: null, key };
        }
        const cmd = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: key });
        const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, cmd, { expiresIn });
        return { configured: true, downloadUrl, key, expiresIn };
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map