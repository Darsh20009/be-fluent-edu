const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '5000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  
  const io = new Server(httpServer, {
    path: '/api/socket/io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id)

    socket.on('join-room', (userId) => {
      socket.join(`user-${userId}`)
      console.log(`✅ User ${userId} joined room`)
    })

    socket.on('send-message', (data) => {
      const { toUserId, fromUserId, message } = data
      console.log(`📨 Sending message from ${fromUserId} to ${toUserId}`)
      io.to(`user-${toUserId}`).emit('new-message', {
        fromUserId,
        message,
        timestamp: new Date()
      })
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> Socket.IO server running on path: /api/socket/io`)
    })
})
