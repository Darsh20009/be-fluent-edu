const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.EXTERNAL_DATABASE_URL,
  options: '-c search_path=public'
});

async function setup() {
  try {
    await client.connect();
    console.log('✅ Connected');
    
    // Set search path for this session
    await client.query('SET search_path TO public;');
    
    // Create enums
    await client.query(`CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'ASSISTANT', 'GUEST');`);
    console.log('✅ Enums created');
    
    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    try { await client.end(); } catch(e) {}
  }
}

setup();
