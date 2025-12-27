#!/usr/bin/env node

// Setup database connection before starting the server
const { spawn } = require('child_process');

// Debug: Show all environment variables (for troubleshooting)
console.log('🔍 Checking environment variables...');
const mongoUri = process.env.MONGODB_URI;

console.log(`MONGODB_URI: ${mongoUri ? '✓ Present' : '✗ Not found'}`);

// IMPORTANT: For YouSpeak, always use MONGODB_URI
if (mongoUri) {
  // Override DATABASE_URL with MONGODB_URI for MongoDB
  process.env.DATABASE_URL = mongoUri;
  console.log('✅ MongoDB database configured successfully');
  console.log(`Connection: ${mongoUri.substring(0, 50)}...`);
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
