require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixUser() {
  try {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'ai_admin@lossdefender.local' },
      data: { 
        passwordHash: hashedPassword,
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ User successfully updated!', { email: updatedUser.email, status: updatedUser.status });
    
    const match = await bcrypt.compare('Admin123!', updatedUser.passwordHash);
    console.log('🔑 Verification Password Match Result:', match);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

fixUser();
