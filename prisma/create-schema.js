const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.EXTERNAL_DATABASE_URL
});

async function createSchema() {
  try {
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Create public schema
    await client.query('CREATE SCHEMA IF NOT EXISTS public;');
    console.log('✅ Public schema created');
    
    // Grant permissions
    await client.query('GRANT ALL ON SCHEMA public TO befluent_exercisein;');
    console.log('✅ Permissions granted');
    
    // Set search path
    await client.query('ALTER DATABASE befluent_exercisein SET search_path TO public;');
    console.log('✅ Search path set');
    
    await client.end();
    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

createSchema();
