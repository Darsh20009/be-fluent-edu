const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFields() {
  try {
    // Query directly using raw SQL to check column names
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'youspeak_exercisein' 
      AND table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns in User table:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();
