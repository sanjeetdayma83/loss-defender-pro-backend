/*
  Warnings:

  - A unique constraint covering the columns `[companyId,marketplace,marketplaceOrderId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "orders_companyId_marketplace_marketplaceOrderId_key" ON "orders"("companyId", "marketplace", "marketplaceOrderId");
