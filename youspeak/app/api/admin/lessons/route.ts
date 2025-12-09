import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessons = await prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      include: {
        exercises: {
          select: { id: true, type: true }
        },
        _count: {
          select: { LessonProgress: true }
        }
      }
    })

    const lessonsWithStats = lessons.map((lesson: typeof lessons[0]) => ({
      ...lesson,
      exerciseCount: lesson.exercises.length,
      studentsCount: lesson._count.LessonProgress,
      exercises: undefined,
      _count: undefined
    }))

    return NextResponse.json(lessonsWithStats)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      titleAr,
      description,
      descriptionAr,
      level,
      category,
      categoryAr,
      videoUrl,
      videoDuration,
      articleContent,
      articleContentAr,
      thumbnailUrl,
      isPublished,
      order
    } = body

    if (!title || !titleAr) {
      return NextResponse.json({ error: 'Title is required in both languages' }, { status: 400 })
    }

    const lastLesson = await prisma.lesson.findFirst({
      orderBy: { order: 'desc' }
    })

    const lesson = await prisma.lesson.create({
      data: {
        title,
        titleAr,
        description,
        descriptionAr,
        level: level || 'BEGINNER',
        category,
        categoryAr,
        videoUrl,
        videoDuration,
        articleContent,
        articleContentAr,
        thumbnailUrl,
        isPublished: isPublished || false,
        order: order ?? (lastLesson ? lastLesson.order + 1 : 1)
      }
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
