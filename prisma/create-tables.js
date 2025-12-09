const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.EXTERNAL_DATABASE_URL
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Connected successfully');
    
    // Create enums
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'ASSISTANT', 'GUEST');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ UserRole enum created');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ SessionStatus enum created');
    
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "LanguageLevel" AS ENUM ('A1', 'A2', 'B1', 'B2');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ LanguageLevel enum created');
    
    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        "passwordHash" TEXT NOT NULL,
        role "UserRole" DEFAULT 'STUDENT'::\"UserRole\" NOT NULL,
        "profilePhoto" TEXT,
        "isActive" BOOLEAN DEFAULT false NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);
    console.log('✅ User table created');
    
    await client.end();
    console.log('✅ Basic tables created! Now running prisma db push...');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await client.end();
    process.exit(1);
  }
}

createTables();
