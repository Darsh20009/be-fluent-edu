import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {
      isPublished: true
    }

    if (level) {
      where.level = level
    }

    if (category) {
      where.category = category
    }

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        exercises: {
          select: { id: true, type: true }
        },
        LessonProgress: {
          where: { studentId: session.user.id }
        }
      }
    })

    const lessonsWithProgress = lessons.map((lesson: typeof lessons[0]) => ({
      ...lesson,
      exerciseCount: lesson.exercises.length,
      progress: lesson.LessonProgress[0] || null,
      exercises: undefined,
      LessonProgress: undefined
    }))

    return NextResponse.json(lessonsWithProgress)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}
