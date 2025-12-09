import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, isNextResponse } from '@/lib/auth-helpers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const message = await prisma.chat.findUnique({
      where: { id }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const isAdmin = session.role === 'ADMIN' || session.role === 'ASSISTANT'
    const isSender = message.fromUserId === session.userId
    const isReceiver = message.toUserId === session.userId

    if (!isAdmin && !isSender && !isReceiver) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.chat.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
