import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer
    }
  }
}

export const initSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id)

    socket.on('join-room', (userId: string) => {
      socket.join(`user-${userId}`)
      console.log(`User ${userId} joined room`)
    })

    socket.on('send-message', (data) => {
      const { toUserId, fromUserId, message } = data
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

  return io
}
