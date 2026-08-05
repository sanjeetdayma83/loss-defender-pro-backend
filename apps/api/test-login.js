require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

console.log('🔗 Using Database URL:', process.env.DATABASE_URL ? 'Loaded Successfully ✅' : 'NOT FOUND ❌');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkLogin() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { email: 'ai_admin@lossdefender.local' } 
    });
    
    if (!user) {
      console.log('❌ User database mein nahi mila!');
      return;
    }
    
    console.log('✅ User Found:', { email: user.email, isActive: user.isActive });
    const match = await bcrypt.compare('Admin123!', user.passwordHash);
    console.log('🔑 Password Match Result:', match);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkLogin();
