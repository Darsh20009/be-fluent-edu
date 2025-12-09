import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ListeningExercise } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      exerciseId,
      visitorId,
      answer
    } = body

    if (!exerciseId || !visitorId || answer === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const exercise = await prisma.listeningExercise.findUnique({
      where: { id: exerciseId }
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    const isCorrect = answer.toString().toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim()
    const points = isCorrect ? exercise.points : 0

    const attempt = await prisma.listeningExerciseAttempt.create({
      data: {
        exerciseId,
        visitorId,
        answer: answer.toString(),
        isCorrect,
        points
      }
    })

    return NextResponse.json({
      ...attempt,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      explanationAr: exercise.explanationAr
    })
  } catch (error) {
    console.error('Error submitting attempt:', error)
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 })
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

    let where: any = { visitorId }

    if (contentId) {
      const exercises = await prisma.listeningExercise.findMany({
        where: { contentId },
        select: { id: true }
      })
      const exerciseIds = exercises.map((e: { id: string }) => e.id)
      where.exerciseId = { in: exerciseIds }
    }

    const attempts = await prisma.listeningExerciseAttempt.findMany({
      where,
      include: {
        Exercise: {
          select: {
            id: true,
            question: true,
            questionAr: true,
            correctAnswer: true
          }
        }
      },
      orderBy: { attemptedAt: 'desc' }
    })

    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}
