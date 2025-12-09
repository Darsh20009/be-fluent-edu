#!/usr/bin/env node

// Setup database connection before starting the server
const { spawn } = require('child_process');

// Check for DATABASE_URL (PostgreSQL)
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  console.log('✅ PostgreSQL database configured from DATABASE_URL');
  console.log('');
} else {
  console.error('❌ ERROR: No database configuration found!');
  console.error('Please set DATABASE_URL environment variable');
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
