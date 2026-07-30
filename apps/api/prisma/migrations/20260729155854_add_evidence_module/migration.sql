-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('CREATED', 'GENERATING', 'GENERATED', 'VERIFIED', 'ARCHIVED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PACKING_VIDEO', 'THUMBNAIL', 'FRAME_CAPTURE', 'AI_REPORT', 'PDF_REPORT');

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "status" "EvidenceStatus" NOT NULL DEFAULT 'CREATED',
    "type" "EvidenceType" NOT NULL DEFAULT 'PACKING_VIDEO',
    "originalVideoUrl" TEXT,
    "processedVideoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "hash" TEXT,
    "checksum" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "fileSize" BIGINT,
    "metadata" JSONB,
    "generatedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidence_companyId_idx" ON "evidence"("companyId");

-- CreateIndex
CREATE INDEX "evidence_warehouseId_idx" ON "evidence"("warehouseId");

-- CreateIndex
CREATE INDEX "evidence_orderId_idx" ON "evidence"("orderId");

-- CreateIndex
CREATE INDEX "evidence_recordingId_idx" ON "evidence"("recordingId");

-- CreateIndex
CREATE INDEX "evidence_status_idx" ON "evidence"("status");

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "recording_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
