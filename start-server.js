#!/usr/bin/env node

// Setup database connection before starting the server
const { spawn } = require('child_process');

// Debug: Show all environment variables (for troubleshooting)
console.log('🔍 Checking environment variables...');
const databaseUrl = process.env.DATABASE_URL;
const mongoUri = process.env.MONGODB_URI;

console.log(`DATABASE_URL: ${databaseUrl ? '✓ Present' : '✗ Not found'}`);
console.log(`MONGODB_URI: ${mongoUri ? '✓ Present' : '✗ Not found'}`);

// Check for DATABASE_URL (MongoDB)
// Support both DATABASE_URL and MONGODB_URI
const finalDatabaseUrl = databaseUrl || mongoUri;

if (finalDatabaseUrl) {
  // For MongoDB, set DATABASE_URL from MONGODB_URI if needed
  if (!databaseUrl && mongoUri) {
    process.env.DATABASE_URL = mongoUri;
  }
  // If still no DATABASE_URL, set it now
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = finalDatabaseUrl;
  }
  console.log('✅ MongoDB database configured successfully');
  console.log(`Connection: ${finalDatabaseUrl.substring(0, 50)}...`);
  console.log('');
} else {
  console.error('');
  console.error('❌ ERROR: No database configuration found!');
  console.error('');
  console.error('Please set ONE of these environment variables:');
  console.error('  1. DATABASE_URL');
  console.error('  2. MONGODB_URI');
  console.error('');
  console.error('Example:');
  console.error('  DATABASE_URL=mongodb+srv://user:pass@host/dbname');
  console.error('');
  process.exit(1);
}

// Start the Next.js server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGTERM', () => {
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
});
