const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    // First check what tables exist in the schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'befluent_exercisein'
      ORDER BY table_name
    `;
    
    console.log('Tables in befluent_exercisein schema:');
    console.log(JSON.stringify(tables, null, 2));
    
    // Now try to get user data
    console.log('\nTrying to fetch a user...');
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        passwordHash: true
      }
    });
    
    if (user) {
      console.log('\n✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Active:', user.isActive);
      console.log('   Has passwordHash?:', !!user.passwordHash);
      console.log('   passwordHash value:', user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'NULL');
    } else {
      console.log('\n❌ No users found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
