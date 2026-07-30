-- CreateEnum
CREATE TYPE "Marketplace" AS ENUM ('AMAZON', 'FLIPKART', 'MEESHO', 'SHOPIFY', 'WOOCOMMERCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ASSIGNED', 'RECORDING', 'VERIFIED', 'DISPATCHED', 'DELIVERED', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED');

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100),
    "pincode" VARCHAR(20),
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "marketplace" "Marketplace" NOT NULL,
    "marketplaceOrderId" VARCHAR(100),
    "marketplaceShipmentId" VARCHAR(100),
    "orderNumber" VARCHAR(100) NOT NULL,
    "awbNumber" VARCHAR(100),
    "customerName" VARCHAR(150),
    "customerPhone" VARCHAR(30),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "expectedItemCount" INTEGER NOT NULL DEFAULT 0,
    "verifiedItemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "warehouses_companyId_idx" ON "warehouses"("companyId");

-- CreateIndex
CREATE INDEX "warehouses_name_idx" ON "warehouses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_companyId_code_key" ON "warehouses"("companyId", "code");

-- CreateIndex
CREATE INDEX "orders_companyId_idx" ON "orders"("companyId");

-- CreateIndex
CREATE INDEX "orders_warehouseId_idx" ON "orders"("warehouseId");

-- CreateIndex
CREATE INDEX "orders_createdById_idx" ON "orders"("createdById");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_marketplace_idx" ON "orders"("marketplace");

-- CreateIndex
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "orders_awbNumber_idx" ON "orders"("awbNumber");

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
