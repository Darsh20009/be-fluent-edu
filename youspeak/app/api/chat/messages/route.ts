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

    const { searchParams } = new URL(req.url)
    const otherUserId = searchParams.get('userId')

    if (!otherUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const messages = await prisma.chat.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: session.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        User_Chat_fromUserIdToUser: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { toUserId, content, attachments } = await req.json()

    if (!toUserId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await prisma.chat.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        content,
        attachments: attachments || null,
        isSaved: false
      },
      include: {
        User_Chat_fromUserIdToUser: {
          select: {
            id: true,
            name: true,
            profilePhoto: true
          }
        }
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
