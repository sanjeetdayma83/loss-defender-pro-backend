-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('CREATED', 'STARTED', 'PAUSED', 'RESUMED', 'STOPPED', 'UPLOADING', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "recording_sessions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'CREATED',
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "localFileName" TEXT,
    "originalFileName" TEXT,
    "fileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "fileSize" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "recording_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recording_sessions_companyId_idx" ON "recording_sessions"("companyId");

-- CreateIndex
CREATE INDEX "recording_sessions_warehouseId_idx" ON "recording_sessions"("warehouseId");

-- CreateIndex
CREATE INDEX "recording_sessions_orderId_idx" ON "recording_sessions"("orderId");

-- CreateIndex
CREATE INDEX "recording_sessions_operatorId_idx" ON "recording_sessions"("operatorId");

-- CreateIndex
CREATE INDEX "recording_sessions_status_idx" ON "recording_sessions"("status");

-- AddForeignKey
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recording_sessions" ADD CONSTRAINT "recording_sessions_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
