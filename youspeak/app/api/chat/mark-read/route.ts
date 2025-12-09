import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fromUserId } = await req.json()

    if (!fromUserId) {
      return NextResponse.json({ error: 'From user ID required' }, { status: 400 })
    }

    await prisma.chat.updateMany({
      where: {
        fromUserId: fromUserId,
        toUserId: session.user.id,
        isSaved: false
      },
      data: {
        isSaved: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
  }
}
