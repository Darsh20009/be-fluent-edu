import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { videoWatched, articleRead, exercisesScore, completed } = body

    const lesson = await prisma.lesson.findUnique({
      where: { id }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId: id
        }
      },
      update: {
        ...(videoWatched !== undefined && { videoWatched }),
        ...(articleRead !== undefined && { articleRead }),
        ...(exercisesScore !== undefined && { exercisesScore }),
        ...(completed !== undefined && { 
          completed,
          completedAt: completed ? new Date() : null
        })
      },
      create: {
        studentId: session.user.id,
        lessonId: id,
        videoWatched: videoWatched || false,
        articleRead: articleRead || false,
        exercisesScore: exercisesScore || null,
        completed: completed || false,
        completedAt: completed ? new Date() : null
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
