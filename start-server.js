/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getToken } = require('next-auth/jwt');
const { PrismaClient } = require('@prisma/client');
const { transitionSpeakingRoomMember } = require('./lib/phase8-speaking-membership.js');
const { startWhatsAppWorkerRunner } = require('./server/whatsapp-worker-runner.cjs');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '5000', 10);
const app = next({ dev });
const handle = app.getRequestHandler();
const realtimePrisma = new PrismaClient();

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
      origin: (origin, callback) => {
        const allowed = [process.env.APP_URL, process.env.NEXTAUTH_URL, 'http://localhost:5000', 'http://127.0.0.1:5000'].filter(Boolean);
        callback(null, !origin || allowed.includes(origin));
      },
      methods: ['GET', 'POST']
    }
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    socket.on('speaking:join', async (payload, callback) => {
      const done = typeof callback === 'function' ? callback : () => {};
      if (process.env.PHASE5_DATABASE_ENABLED !== 'true' || !socket.userId) return done({ ok: false, code: 'DATABASE_UNAVAILABLE' });
      const roomId = payload && typeof payload.roomId === 'string' ? payload.roomId : '';
      if (!roomId) return done({ ok: false, code: 'INVALID_ROOM' });
      const member = await realtimePrisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId, userId: socket.userId } } }).catch(() => null);
      const room = await realtimePrisma.speakingRoom.findUnique({ where: { id: roomId }, select: { status: true } }).catch(() => null);
      if (!member || member.status !== 'ACTIVE' || !room || !['OPEN', 'ACTIVE'].includes(room.status)) return done({ ok: false, code: 'MEMBERSHIP_REQUIRED' });
      socket.join(`speaking:${roomId}`);
      socket.speakingRooms = socket.speakingRooms || new Set();
      socket.speakingRooms.add(roomId);
      socket.to(`speaking:${roomId}`).emit('speaking:member-joined', { userId: socket.userId });
      done({ ok: true, roomId });
    });

    socket.on('speaking:leave', async (payload, callback) => {
      const done = typeof callback === 'function' ? callback : () => {};
      const roomId = payload && typeof payload.roomId === 'string' ? payload.roomId : '';
      if (!roomId || !socket.userId) return done({ ok: false, code: 'INVALID_ROOM' });
      if (process.env.PHASE5_DATABASE_ENABLED === 'true') {
        try {
          await transitionSpeakingRoomMember(realtimePrisma, { roomId, userId: socket.userId, transition: 'DEACTIVATE', status: 'LEFT' });
        } catch (error) {
          return done({ ok: false, code: error && error.code ? error.code : 'MEMBERSHIP_TRANSITION_FAILED' });
        }
      }
      socket.leave(`speaking:${roomId}`);
      socket.speakingRooms?.delete(roomId);
      socket.to(`speaking:${roomId}`).emit('speaking:member-left', { userId: socket.userId });
      done({ ok: true });
    });

    socket.on('speaking:message', async (payload, callback) => {
      const done = typeof callback === 'function' ? callback : () => {};
      if (process.env.PHASE5_DATABASE_ENABLED !== 'true' || !socket.userId) return done({ ok: false, code: 'DATABASE_UNAVAILABLE' });
      const roomId = payload && typeof payload.roomId === 'string' ? payload.roomId : '';
      const messageType = payload && payload.messageType === 'VOICE' ? 'VOICE' : 'TEXT';
      const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
      const voiceRef = typeof payload?.voiceRef === 'string' ? payload.voiceRef.trim() : '';
      if (messageType === 'VOICE') return done({ ok: false, code: 'PROVIDER_UNAVAILABLE' });
      if (!roomId || (messageType === 'TEXT' && (!text || text.length > 4000)) || (messageType === 'VOICE' && !voiceRef)) return done({ ok: false, code: 'INVALID_MESSAGE' });
      const member = await realtimePrisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId, userId: socket.userId } } }).catch(() => null);
      if (!member || member.status !== 'ACTIVE' || member.muted) return done({ ok: false, code: 'MEMBERSHIP_REQUIRED' });
      const message = await realtimePrisma.speakingRoomMessage.create({ data: { roomId, senderId: socket.userId, messageType, text: text || undefined, voiceRef: voiceRef || undefined } }).catch(() => null);
      if (!message) return done({ ok: false, code: 'MESSAGE_FAILED' });
      io.to(`speaking:${roomId}`).emit('speaking:message-created', { id: message.id, roomId, senderId: socket.userId, messageType, text: message.text, voiceRef: message.voiceRef, createdAt: message.createdAt });
      done({ ok: true, messageId: message.id });
    });

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

  io.use(async (socket, next) => {
    try {
      if (process.env.PHASE5_DATABASE_ENABLED !== 'true') return next();
      const token = await getToken({ req: { headers: socket.handshake.headers }, secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET });
      if (!token || typeof token === 'string' || !token.sub) return next(new Error('UNAUTHORIZED'));
      const user = await realtimePrisma.user.findUnique({ where: { id: token.sub }, select: { id: true, isActive: true, status: true } });
      if (!user || !user.isActive || ['PENDING', 'SUSPENDED', 'DISABLED'].includes(user.status)) return next(new Error('UNAUTHORIZED'));
      socket.userId = user.id;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  let whatsappWorkerStop = null;
  let shuttingDown = false;

  const withShutdownTimeout = (promise, timeoutMs) => Promise.race([
    Promise.resolve(promise).catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`🛑 Shutting down on ${signal}...`);
    if (whatsappWorkerStop) {
      await withShutdownTimeout(whatsappWorkerStop(), 5000);
    }
    io.close();
    await withShutdownTimeout(new Promise((resolve) => {
      try {
        server.close(() => resolve());
      } catch {
        resolve();
      }
    }), 5000);
    await withShutdownTimeout(realtimePrisma.$disconnect(), 5000);
    process.exit(0);
  };

  process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.once('SIGINT', () => { void shutdown('SIGINT'); });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log('> Socket.IO server running on path: /api/socket/io');
    whatsappWorkerStop = startWhatsAppWorkerRunner();
  });
});
