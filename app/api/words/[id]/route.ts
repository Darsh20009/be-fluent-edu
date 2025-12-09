import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { known, reviewCount } = body

    const word = await prisma.word.findUnique({
      where: { id }
    })

    if (!word || word.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    const updated = await prisma.word.update({
      where: { id },
      data: {
        known: known !== undefined ? known : word.known,
        reviewCount: reviewCount !== undefined ? reviewCount : word.reviewCount
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating word:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const word = await prisma.word.findUnique({
      where: { id }
    })

    if (!word || word.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }

    await prisma.word.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting word:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
