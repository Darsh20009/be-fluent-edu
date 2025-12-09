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
    const { answer } = body

    if (!answer && answer !== 0) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: { Lesson: true }
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    let isCorrect = false
    const userAnswer = String(answer).toLowerCase().trim()
    const correctAnswer = exercise.correctAnswer.toLowerCase().trim()

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        isCorrect = userAnswer === correctAnswer
        break
      case 'FILL_BLANK':
        const blanks = exercise.blanks ? JSON.parse(exercise.blanks) : []
        const userAnswers = typeof answer === 'string' ? answer.split('|||') : answer
        if (Array.isArray(userAnswers) && Array.isArray(blanks)) {
          isCorrect = blanks.every((blank: string, index: number) => 
            userAnswers[index]?.toLowerCase().trim() === blank.toLowerCase().trim()
          )
        } else {
          isCorrect = userAnswer === correctAnswer
        }
        break
      case 'DRAG_DROP':
        try {
          const userOrder = typeof answer === 'string' ? JSON.parse(answer) : answer
          const correctOrder = JSON.parse(exercise.correctAnswer)
          isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder)
        } catch {
          isCorrect = false
        }
        break
      case 'SENTENCE_READING':
        isCorrect = true
        break
      default:
        isCorrect = userAnswer === correctAnswer
    }

    const points = isCorrect ? exercise.points : 0

    const attempt = await prisma.exerciseAttempt.create({
      data: {
        studentId: session.user.id,
        exerciseId: id,
        answer: String(answer),
        isCorrect,
        points
      }
    })

    const allExercises = await prisma.exercise.findMany({
      where: { lessonId: exercise.lessonId }
    })

    const allAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        studentId: session.user.id,
        exerciseId: { in: allExercises.map(e => e.id) }
      }
    })

    const uniqueAttempts = new Map<string, boolean>()
    allAttempts.forEach(a => {
      if (!uniqueAttempts.has(a.exerciseId) || a.isCorrect) {
        uniqueAttempts.set(a.exerciseId, a.isCorrect)
      }
    })

    const correctCount = Array.from(uniqueAttempts.values()).filter(v => v).length
    const exercisesScore = (correctCount / allExercises.length) * 100

    await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: session.user.id,
          lessonId: exercise.lessonId
        }
      },
      update: { exercisesScore },
      create: {
        studentId: session.user.id,
        lessonId: exercise.lessonId,
        exercisesScore
      }
    })

    return NextResponse.json({
      ...attempt,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      explanationAr: exercise.explanationAr,
      exercisesScore
    })
  } catch (error) {
    console.error('Error submitting attempt:', error)
    return NextResponse.json({ error: 'Failed to submit attempt' }, { status: 500 })
  }
}
