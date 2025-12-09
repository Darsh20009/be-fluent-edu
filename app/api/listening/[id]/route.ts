import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const content = await prisma.listeningContent.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching listening content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const content = await prisma.listeningContent.update({
      where: { id },
      data: {
        title: body.title,
        titleAr: body.titleAr,
        description: body.description,
        descriptionAr: body.descriptionAr,
        mediaType: body.mediaType,
        mediaUrl: body.mediaUrl,
        thumbnailUrl: body.thumbnailUrl,
        duration: body.duration,
        level: body.level,
        category: body.category,
        categoryAr: body.categoryAr,
        transcript: body.transcript,
        transcriptAr: body.transcriptAr,
        order: body.order,
        isPublished: body.isPublished
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating listening content:', error)
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.listeningContent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listening content:', error)
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 })
  }
}
