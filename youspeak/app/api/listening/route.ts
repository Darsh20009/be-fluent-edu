import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ListeningContent } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')
    const mediaType = searchParams.get('mediaType')
    const showAll = searchParams.get('all') === 'true'

    const isAdmin = session?.user?.role && ['ADMIN', 'TEACHER', 'ASSISTANT'].includes(session.user.role)
    
    const where: any = {}
    
    if (!showAll || !isAdmin) {
      where.isPublished = true
    }

    if (level) where.level = level
    if (category) where.category = category
    if (mediaType) where.mediaType = mediaType

    const contents = await prisma.listeningContent.findMany({
      where,
      include: {
        exercises: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    const formattedContents = contents.map((content: ListeningContent & { exercises: { id: string }[] }) => ({
      ...content,
      exercisesCount: content.exercises.length,
      exercises: undefined
    }))

    return NextResponse.json(formattedContents)
  } catch (error) {
    console.error('Error fetching listening contents:', error)
    return NextResponse.json({ error: 'Failed to fetch contents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      duration,
      level,
      category,
      categoryAr,
      transcript,
      transcriptAr,
      order,
      isPublished
    } = body

    if (!title || !titleAr || !mediaType || !mediaUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const content = await prisma.listeningContent.create({
      data: {
        title,
        titleAr,
        description,
        descriptionAr,
        mediaType,
        mediaUrl,
        thumbnailUrl,
        duration,
        level: level || 'BEGINNER',
        category,
        categoryAr,
        transcript,
        transcriptAr,
        order: order || 0,
        isPublished: isPublished !== false
      }
    })

    return NextResponse.json(content, { status: 201 })
  } catch (error) {
    console.error('Error creating listening content:', error)
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 })
  }
}
