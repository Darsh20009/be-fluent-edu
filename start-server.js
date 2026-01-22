const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Validate environment variables
console.log('🔍 Checking environment variables...');
if (process.env.MONGODB_URI) {
  process.env.DATABASE_URL = process.env.MONGODB_URI;
  console.log('✅ DATABASE_URL set from MONGODB_URI');
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  server.listen(5000, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log('> Ready on http://0.0.0.0:5000');
    console.log('> Socket.IO server running on path: /api/socket/io');
  });
});
