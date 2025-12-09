import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contentId,
      visitorId,
      listenedDuration,
      completed,
      exercisesScore
    } = body

    if (!contentId || !visitorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingProgress = await prisma.listeningProgress.findFirst({
      where: {
        contentId,
        visitorId
      }
    })

    let progress
    if (existingProgress) {
      progress = await prisma.listeningProgress.update({
        where: { id: existingProgress.id },
        data: {
          listenedDuration: listenedDuration || existingProgress.listenedDuration,
          completed: completed !== undefined ? completed : existingProgress.completed,
          exercisesScore: exercisesScore !== undefined ? exercisesScore : existingProgress.exercisesScore,
          completedAt: completed ? new Date() : existingProgress.completedAt
        }
      })
    } else {
      progress = await prisma.listeningProgress.create({
        data: {
          contentId,
          visitorId,
          listenedDuration: listenedDuration || 0,
          completed: completed || false,
          exercisesScore,
          completedAt: completed ? new Date() : null
        }
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const visitorId = searchParams.get('visitorId')
    const contentId = searchParams.get('contentId')

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 })
    }

    const where: any = { visitorId }
    if (contentId) {
      where.contentId = contentId
    }

    const progress = await prisma.listeningProgress.findMany({
      where,
      include: {
        ListeningContent: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            mediaType: true
          }
        }
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
