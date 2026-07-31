-- CreateEnum
CREATE TYPE "PackingStatus" AS ENUM ('PENDING', 'STARTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADING', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'DELETED');

-- CreateEnum
CREATE TYPE "UploadCategory" AS ENUM ('RECORDING', 'THUMBNAIL', 'EVIDENCE', 'REPORT', 'DOCUMENT', 'AVATAR', 'OTHER');

-- CreateEnum
CREATE TYPE "UploadVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('OPENAI', 'GEMINI', 'LOCAL');

-- CreateEnum
CREATE TYPE "AIJobStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WHATSAPP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'AI_ANALYZING', 'WAITING_FOR_EVIDENCE', 'APPROVED', 'REJECTED', 'RESOLVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClaimPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ClaimResolutionType" AS ENUM ('REFUND', 'REPLACEMENT', 'PARTIAL_REFUND', 'DENIED', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('DRAFT', 'CREATED', 'UNDER_REVIEW', 'AI_ANALYZING', 'WAITING_FOR_EVIDENCE', 'APPROVED', 'REJECTED', 'REFUNDED', 'REPLACED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReturnResolutionType" AS ENUM ('REFUND', 'REPLACEMENT', 'PARTIAL_REFUND', 'DENIED', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'SCANNED', 'VERIFIED', 'DUPLICATE', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'CREATED';
ALTER TYPE "OrderStatus" ADD VALUE 'PICKING';
ALTER TYPE "OrderStatus" ADD VALUE 'PACKING';
ALTER TYPE "OrderStatus" ADD VALUE 'VERIFYING';
ALTER TYPE "OrderStatus" ADD VALUE 'READY_TO_SHIP';
ALTER TYPE "OrderStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "OrderStatus" ADD VALUE 'CLAIMED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "packingStatus" "PackingStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT,
    "recordingId" TEXT,
    "evidenceId" TEXT,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "category" "UploadCategory" NOT NULL,
    "visibility" "UploadVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',
    "size" BIGINT NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "hash" TEXT,
    "etag" TEXT,
    "metadata" JSONB,
    "uploadedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT,
    "uploadId" TEXT,
    "recordingId" TEXT,
    "evidenceId" TEXT,
    "provider" "AIProvider" NOT NULL,
    "model" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "AIJobStatus" NOT NULL DEFAULT 'PENDING',
    "prompt" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tokensUsed" INTEGER,
    "processingTime" INTEGER,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "template" TEXT,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "data" JSONB,
    "metadata" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "claimNumber" VARCHAR(50) NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recordingId" TEXT,
    "evidenceId" TEXT,
    "aiJobId" TEXT,
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ClaimPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolutionType" "ClaimResolutionType",
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customerRemarks" TEXT,
    "internalRemarks" TEXT,
    "aiSummary" TEXT,
    "aiConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiRecommendation" TEXT,
    "metadata" JSONB,
    "resolutionData" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "returns" (
    "id" TEXT NOT NULL,
    "returnNumber" VARCHAR(50) NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "claimId" TEXT,
    "recordingId" TEXT,
    "evidenceId" TEXT,
    "aiJobId" TEXT,
    "assignedTo" TEXT,
    "resolvedBy" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ReturnPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolutionType" "ReturnResolutionType",
    "marketplace" TEXT NOT NULL,
    "marketplaceReturnId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customerReason" TEXT,
    "internalRemarks" TEXT,
    "aiSummary" TEXT,
    "aiConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiRecommendation" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "refundCurrency" TEXT,
    "replacementOrderId" TEXT,
    "replacementTrackingNumber" TEXT,
    "metadata" JSONB,
    "resolutionData" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "evidenceId" TEXT,
    "scannedBy" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "barcode" TEXT NOT NULL,
    "barcodeType" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "location" JSONB,
    "device" JSONB,
    "result" JSONB,
    "statistics" JSONB,
    "remarks" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT,
    "generatedBy" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "dateRange" JSONB,
    "summary" JSONB,
    "kpi" JSONB,
    "exportFormat" TEXT,
    "downloadUrl" TEXT,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleCron" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploads_storageKey_key" ON "uploads"("storageKey");

-- CreateIndex
CREATE INDEX "uploads_companyId_idx" ON "uploads"("companyId");

-- CreateIndex
CREATE INDEX "uploads_warehouseId_idx" ON "uploads"("warehouseId");

-- CreateIndex
CREATE INDEX "uploads_orderId_idx" ON "uploads"("orderId");

-- CreateIndex
CREATE INDEX "uploads_recordingId_idx" ON "uploads"("recordingId");

-- CreateIndex
CREATE INDEX "uploads_evidenceId_idx" ON "uploads"("evidenceId");

-- CreateIndex
CREATE INDEX "uploads_status_idx" ON "uploads"("status");

-- CreateIndex
CREATE INDEX "uploads_category_idx" ON "uploads"("category");

-- CreateIndex
CREATE INDEX "uploads_storageKey_idx" ON "uploads"("storageKey");

-- CreateIndex
CREATE INDEX "ai_jobs_companyId_idx" ON "ai_jobs"("companyId");

-- CreateIndex
CREATE INDEX "ai_jobs_warehouseId_idx" ON "ai_jobs"("warehouseId");

-- CreateIndex
CREATE INDEX "ai_jobs_status_idx" ON "ai_jobs"("status");

-- CreateIndex
CREATE INDEX "ai_jobs_provider_idx" ON "ai_jobs"("provider");

-- CreateIndex
CREATE INDEX "notifications_companyId_idx" ON "notifications"("companyId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_channel_idx" ON "notifications"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE INDEX "claims_companyId_idx" ON "claims"("companyId");

-- CreateIndex
CREATE INDEX "claims_warehouseId_idx" ON "claims"("warehouseId");

-- CreateIndex
CREATE INDEX "claims_orderId_idx" ON "claims"("orderId");

-- CreateIndex
CREATE INDEX "claims_status_idx" ON "claims"("status");

-- CreateIndex
CREATE INDEX "claims_priority_idx" ON "claims"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "returns_returnNumber_key" ON "returns"("returnNumber");

-- CreateIndex
CREATE INDEX "returns_companyId_idx" ON "returns"("companyId");

-- CreateIndex
CREATE INDEX "returns_warehouseId_idx" ON "returns"("warehouseId");

-- CreateIndex
CREATE INDEX "returns_orderId_idx" ON "returns"("orderId");

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "returns"("status");

-- CreateIndex
CREATE INDEX "returns_priority_idx" ON "returns"("priority");

-- CreateIndex
CREATE INDEX "scans_companyId_idx" ON "scans"("companyId");

-- CreateIndex
CREATE INDEX "scans_warehouseId_idx" ON "scans"("warehouseId");

-- CreateIndex
CREATE INDEX "scans_orderId_idx" ON "scans"("orderId");

-- CreateIndex
CREATE INDEX "scans_sessionId_idx" ON "scans"("sessionId");

-- CreateIndex
CREATE INDEX "scans_barcode_idx" ON "scans"("barcode");

-- CreateIndex
CREATE INDEX "scans_status_idx" ON "scans"("status");

-- CreateIndex
CREATE INDEX "reports_companyId_idx" ON "reports"("companyId");

-- CreateIndex
CREATE INDEX "reports_warehouseId_idx" ON "reports"("warehouseId");

-- CreateIndex
CREATE INDEX "reports_reportType_idx" ON "reports"("reportType");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "orders_packingStatus_idx" ON "orders"("packingStatus");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recording_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recording_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recording_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "ai_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recording_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_aiJobId_fkey" FOREIGN KEY ("aiJobId") REFERENCES "ai_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "returns" ADD CONSTRAINT "returns_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "recording_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_scannedBy_fkey" FOREIGN KEY ("scannedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
