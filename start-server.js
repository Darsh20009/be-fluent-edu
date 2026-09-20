const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '5000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('🔍 Checking environment variables...');
console.log(process.env.MONGODB_URI ? '✅ MongoDB environment configured' : '⚠️ MONGODB_URI is not set');

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

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('join-room', (roomId, odId, userName) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      const room = rooms.get(roomId);
      room.set(socket.id, { odId, userName });
      
      console.log(`👤 ${userName} joined room ${roomId}`);
      
      socket.to(roomId).emit('user-connected', { odId, userName, socketId: socket.id });
      
      const existingUsers = [];
      room.forEach((user, sid) => {
        if (sid !== socket.id) {
          existingUsers.push({ ...user, socketId: sid });
        }
      });
      socket.emit('existing-users', existingUsers);
    });

    socket.on('offer', (data) => {
      console.log(`📤 Offer from ${socket.id} to ${data.targetSocketId}`);
      io.to(data.targetSocketId).emit('offer', {
        offer: data.offer,
        fromSocketId: socket.id,
        userName: data.userName
      });
    });

    socket.on('answer', (data) => {
      console.log(`📥 Answer from ${socket.id} to ${data.targetSocketId}`);
      io.to(data.targetSocketId).emit('answer', {
        answer: data.answer,
        fromSocketId: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      io.to(data.targetSocketId).emit('ice-candidate', {
        candidate: data.candidate,
        fromSocketId: socket.id
      });
    });

    socket.on('send-message', (data) => {
      socket.to(data.roomId).emit('receive-message', {
        user: data.user,
        message: data.message
      });
    });

    socket.on('raise-hand', (data) => {
      socket.to(data.roomId).emit('hand-raised', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('toggle-mute', (data) => {
      io.to(data.targetSocketId).emit('toggle-mute', {
        mute: data.mute
      });
    });

    socket.on('draw', (data) => {
      socket.to(data.roomId).emit('draw', data);
    });

    socket.on('mute-all', (data) => {
      socket.to(data.roomId).emit('toggle-mute', {
        mute: true
      });
    });

    socket.on('stealth-join', (roomId) => {
      socket.join(roomId);
      socket.isStealth = true;
      console.log(`🕵️ Manager joined room ${roomId} in stealth mode`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
      
      rooms.forEach((room, roomId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          socket.to(roomId).emit('user-disconnected', { socketId: socket.id });
          if (room.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log('> Socket.IO server running on path: /api/socket/io');
  });
});
