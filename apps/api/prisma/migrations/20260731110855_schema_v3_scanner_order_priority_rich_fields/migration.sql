/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "address" JSONB,
ADD COLUMN     "blockReason" TEXT,
ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "branding" JSONB,
ADD COLUMN     "companyType" VARCHAR(50),
ADD COLUMN     "contact" JSONB,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gstNumber" VARCHAR(30),
ADD COLUMN     "legalName" VARCHAR(200),
ADD COLUMN     "panNumber" VARCHAR(20),
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "settings" JSONB,
ADD COLUMN     "storage" JSONB,
ADD COLUMN     "subscription" JSONB;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "claimId" TEXT,
ADD COLUMN     "courier" VARCHAR(100),
ADD COLUMN     "customer" JSONB,
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "evidenceId" TEXT,
ADD COLUMN     "items" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" "OrderPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "recordingId" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "returnId" TEXT,
ADD COLUMN     "shippingAddress" JSONB,
ADD COLUMN     "trackingNumber" VARCHAR(100);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "assignment" JSONB,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employeeCode" VARCHAR(50),
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile" JSONB,
ADD COLUMN     "statistics" JSONB,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" VARCHAR(100);

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "addressJson" JSONB,
ADD COLUMN     "capacity" JSONB,
ADD COLUMN     "contactEmail" VARCHAR(150),
ADD COLUMN     "contactPhone" VARCHAR(30),
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "manager" JSONB,
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "status" VARCHAR(30),
ADD COLUMN     "timezone" VARCHAR(50),
ADD COLUMN     "warehouseType" VARCHAR(50);

-- CreateIndex
CREATE INDEX "companies_gstNumber_idx" ON "companies"("gstNumber");

-- CreateIndex
CREATE INDEX "companies_panNumber_idx" ON "companies"("panNumber");

-- CreateIndex
CREATE INDEX "orders_priority_idx" ON "orders"("priority");

-- CreateIndex
CREATE INDEX "orders_assignedTo_idx" ON "orders"("assignedTo");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_employeeCode_idx" ON "users"("employeeCode");
