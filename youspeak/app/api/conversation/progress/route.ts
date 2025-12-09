import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { scenarioId, currentStep, score, completed } = body

    const existingProgress = await prisma.conversationProgress.findUnique({
      where: {
        studentId_scenarioId: {
          studentId: user.id,
          scenarioId
        }
      }
    })

    let progress
    if (existingProgress) {
      progress = await prisma.conversationProgress.update({
        where: { id: existingProgress.id },
        data: {
          currentStep,
          score: existingProgress.score + (score || 0),
          completed,
          completedAt: completed ? new Date() : null
        }
      })
    } else {
      progress = await prisma.conversationProgress.create({
        data: {
          studentId: user.id,
          scenarioId,
          currentStep,
          score: score || 0,
          completed,
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const progress = await prisma.conversationProgress.findMany({
      where: { studentId: user.id },
      include: { Scenario: true }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
