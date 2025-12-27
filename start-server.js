#!/usr/bin/env node

// Setup database connection before starting the server
const { spawn } = require('child_process');

// Check for DATABASE_URL (MongoDB)
// Support both DATABASE_URL and MONGODB_URI
const databaseUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (databaseUrl) {
  // Set DATABASE_URL from MONGODB_URI if needed (for Render/other platforms)
  if (!process.env.DATABASE_URL && process.env.MONGODB_URI) {
    process.env.DATABASE_URL = process.env.MONGODB_URI;
  }
  console.log('✅ MongoDB database configured');
  console.log('');
} else {
  console.error('❌ ERROR: No database configuration found!');
  console.error('Please set DATABASE_URL or MONGODB_URI environment variable');
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
