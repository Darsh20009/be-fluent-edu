import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const lesson = await prisma.lesson.findUnique({
      where: { id, isPublished: true },
      include: {
        exercises: {
          orderBy: { order: 'asc' }
        },
        LessonProgress: {
          where: { studentId: session.user.id }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        studentId: session.user.id,
        exerciseId: { in: lesson.exercises.map(e => e.id) }
      }
    })

    const exercisesWithAttempts = lesson.exercises.map(exercise => ({
      ...exercise,
      attempted: exerciseAttempts.some(a => a.exerciseId === exercise.id),
      lastAttempt: exerciseAttempts.find(a => a.exerciseId === exercise.id) || null
    }))

    return NextResponse.json({
      ...lesson,
      exercises: exercisesWithAttempts,
      progress: lesson.LessonProgress[0] || null,
      LessonProgress: undefined
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
  }
}
