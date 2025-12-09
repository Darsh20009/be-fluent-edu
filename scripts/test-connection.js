const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL is set:', !!process.env.DATABASE_URL);
    console.log('');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('✅ Connected to database:');
    console.log(result);
    
    // Try to list schemas
    const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
    console.log('\n📂 Available schemas:');
    console.log(schemas);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
