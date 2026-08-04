import 'dotenv/config';
import { PrismaClient, Marketplace, OrderStatus, OrderPriority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  const company = await prisma.company.findFirst({
    where: { isDeleted: false },
    orderBy: { createdAt: 'asc' },
  });

  if (!company) {
    throw new Error('No company found. Login/create company first, then re-run seed.');
  }
  console.log(`✅ Company: ${company.name} (${company.id})`);

  const warehouses = await prisma.warehouse.findMany({
    where: { companyId: company.id, isDeleted: false },
  });
  if (warehouses.length === 0) {
    throw new Error('No warehouse found for company.');
  }
  console.log(`✅ Warehouses: ${warehouses.length}`);

  const user = await prisma.user.findFirst({
    where: { companyId: company.id, isDeleted: false },
  });
  if (!user) {
    throw new Error('No user found for company.');
  }
  console.log(`✅ User: ${user.email}`);

  const wh = (i: number) => warehouses[i % warehouses.length].id;

  const ordersToCreate = [
    {
      orderNumber: 'ORD-20260804-00010',
      marketplace: Marketplace.AMAZON,
      marketplaceOrderId: 'AMZ-SEED-010',
      customerName: 'Rahul Sharma',
      customerPhone: '9876500010',
      status: OrderStatus.PACKING,
      priority: OrderPriority.MEDIUM,
      awbNumber: 'AWB100010',
      expectedItemCount: 3,
      remarks: 'Seed — packing queue',
    },
    {
      orderNumber: 'ORD-20260804-00011',
      marketplace: Marketplace.FLIPKART,
      marketplaceOrderId: 'FK-SEED-011',
      customerName: 'Neha Verma',
      customerPhone: '9876500011',
      status: OrderStatus.VERIFYING,
      priority: OrderPriority.HIGH,
      awbNumber: 'AWB100011',
      expectedItemCount: 2,
      remarks: 'Seed — verification queue',
    },
    {
      orderNumber: 'ORD-20260804-00012',
      marketplace: Marketplace.MEESHO,
      marketplaceOrderId: 'MSH-SEED-012',
      customerName: 'Amit Kumar',
      customerPhone: '9876500012',
      status: OrderStatus.READY_TO_SHIP,
      priority: OrderPriority.MEDIUM,
      awbNumber: 'AWB100012',
      expectedItemCount: 5,
      remarks: 'Seed — ready to ship',
    },
    {
      orderNumber: 'ORD-20260804-00013',
      marketplace: Marketplace.AMAZON,
      marketplaceOrderId: 'AMZ-SEED-013',
      customerName: 'Pooja Singh',
      customerPhone: '9876500013',
      status: OrderStatus.SHIPPED,
      priority: OrderPriority.LOW,
      awbNumber: 'AWB100013',
      expectedItemCount: 1,
      remarks: 'Seed — shipped',
    },
    {
      orderNumber: 'ORD-20260804-00014',
      marketplace: Marketplace.FLIPKART,
      marketplaceOrderId: 'FK-SEED-014',
      customerName: 'Vikram Patel',
      customerPhone: '9876500014',
      status: OrderStatus.RETURNED,
      priority: OrderPriority.HIGH,
      awbNumber: 'AWB100014',
      expectedItemCount: 4,
      remarks: 'Damaged packaging — customer return',
    },
    {
      orderNumber: 'ORD-20260804-00015',
      marketplace: Marketplace.SHOPIFY,
      marketplaceOrderId: 'SHP-SEED-015',
      customerName: 'Shri Balaji Trading Co.',
      customerPhone: '9876500015',
      status: OrderStatus.RETURNED,
      priority: OrderPriority.CRITICAL,
      awbNumber: 'AWB100015',
      expectedItemCount: 10,
      remarks: 'Shortage in cargo net count',
    },
    {
      orderNumber: 'ORD-20260804-00016',
      marketplace: Marketplace.MANUAL,
      marketplaceOrderId: 'MAN-SEED-016',
      customerName: 'Vikas Enterprises',
      customerPhone: '9876500016',
      status: OrderStatus.CLAIMED,
      priority: OrderPriority.HIGH,
      awbNumber: 'AWB100016',
      expectedItemCount: 2,
      remarks: 'Wrong item dispatched — claim raised',
    },
    {
      orderNumber: 'ORD-20260804-00017',
      marketplace: Marketplace.AMAZON,
      marketplaceOrderId: 'AMZ-SEED-017',
      customerName: 'Sneha Reddy',
      customerPhone: '9876500017',
      status: OrderStatus.PICKING,
      priority: OrderPriority.HIGH,
      awbNumber: null as string | null,
      expectedItemCount: 6,
      remarks: 'Seed — high priority picking',
    },
    {
      orderNumber: 'ORD-20260804-00018',
      marketplace: Marketplace.MEESHO,
      marketplaceOrderId: 'MSH-SEED-018',
      customerName: 'Arjun Mehta',
      customerPhone: '9876500018',
      status: OrderStatus.CREATED,
      priority: OrderPriority.MEDIUM,
      awbNumber: null as string | null,
      expectedItemCount: 2,
      remarks: 'Seed — new order',
    },
    {
      orderNumber: 'ORD-20260804-00019',
      marketplace: Marketplace.FLIPKART,
      marketplaceOrderId: 'FK-SEED-019',
      customerName: 'Kavita Nair',
      customerPhone: '9876500019',
      status: OrderStatus.VERIFIED,
      priority: OrderPriority.MEDIUM,
      awbNumber: 'AWB100019',
      expectedItemCount: 3,
      verifiedItemCount: 3,
      remarks: 'Seed — verified',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < ordersToCreate.length; i++) {
    const o = ordersToCreate[i];
    const existing = await prisma.order.findFirst({
      where: {
        companyId: company.id,
        orderNumber: o.orderNumber,
        isDeleted: false,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.order.create({
      data: {
        companyId: company.id,
        warehouseId: wh(i),
        createdById: user.id,
        marketplace: o.marketplace,
        marketplaceOrderId: o.marketplaceOrderId,
        orderNumber: o.orderNumber,
        awbNumber: o.awbNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        status: o.status,
        priority: o.priority,
        expectedItemCount: o.expectedItemCount,
        verifiedItemCount: (o as any).verifiedItemCount ?? 0,
        remarks: o.remarks,
        customer: {
          name: o.customerName,
          phone: o.customerPhone,
        },
      },
    });
    created++;
    console.log(`  + ${o.orderNumber} [${o.status}] ${o.customerName}`);
  }

  console.log('');
  console.log(`✅ Seed complete: ${created} created, ${skipped} skipped`);
  console.log('   Refresh Dashboard / Returns / Alerts / Orders in Flutter.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
