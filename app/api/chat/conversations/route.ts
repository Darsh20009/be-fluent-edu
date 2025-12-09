import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const sentMessages = await prisma.chat.findMany({
      where: { fromUserId: userId },
      select: { toUserId: true },
      distinct: ['toUserId']
    })

    const receivedMessages = await prisma.chat.findMany({
      where: { toUserId: userId },
      select: { fromUserId: true },
      distinct: ['fromUserId']
    })

    const userIds = new Set([
      ...sentMessages.map(m => m.toUserId),
      ...receivedMessages.map(m => m.fromUserId)
    ])

    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const lastMessage = await prisma.chat.findFirst({
          where: {
            OR: [
              { fromUserId: userId, toUserId: otherUserId },
              { fromUserId: otherUserId, toUserId: userId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          include: {
            User_Chat_fromUserIdToUser: {
              select: { id: true, name: true, profilePhoto: true }
            },
            User_Chat_toUserIdToUser: {
              select: { id: true, name: true, profilePhoto: true }
            }
          }
        })

        const unreadCount = await prisma.chat.count({
          where: {
            fromUserId: otherUserId,
            toUserId: userId,
            isSaved: false
          }
        })

        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePhoto: true
          }
        })

        return {
          user: otherUser,
          lastMessage,
          unreadCount
        }
      })
    )

    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || new Date(0)
      const bTime = b.lastMessage?.createdAt || new Date(0)
      return bTime.getTime() - aTime.getTime()
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
