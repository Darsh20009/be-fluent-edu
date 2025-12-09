const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.EXTERNAL_DATABASE_URL
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Check current user
    const userResult = await client.query('SELECT current_user, current_database();');
    console.log('Current user:', userResult.rows[0]);
    
    // Check schemas
    const schemaResult = await client.query('SELECT schema_name FROM information_schema.schemata;');
    console.log('Schemas:', schemaResult.rows);
    
    // Check permissions
    const permResult = await client.query(`
      SELECT * FROM information_schema.role_table_grants 
      WHERE grantee = current_user LIMIT 5;
    `);
    console.log('Permissions:', permResult.rows);
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

test();
