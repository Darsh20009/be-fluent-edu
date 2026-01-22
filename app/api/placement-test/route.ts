import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  PLACEMENT_TEST_QUESTIONS, 
  calculateLevel, 
  getLevelDescription, 
  getTotalPossibleScore 
} from '@/lib/placement-test-questions'

export async function GET(request: NextRequest) {
  try {
    const questions = PLACEMENT_TEST_QUESTIONS.map(q => ({
      id: q.id,
      type: q.type,
      level: q.level,
      question: q.question,
      questionAr: q.questionAr,
      options: q.options,
      passage: q.passage,
      passageAr: q.passageAr,
      points: q.points
    }))

    return NextResponse.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      totalPossibleScore: getTotalPossibleScore()
    })
  } catch (error) {
    console.error('Error fetching placement test questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      )
    }

    let totalScore = 0
    const results: { questionId: string; correct: boolean; points: number; maxPoints: number }[] = []

    for (const question of PLACEMENT_TEST_QUESTIONS) {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      const pointsEarned = isCorrect ? question.points : 0
      
      totalScore += pointsEarned
      results.push({
        questionId: question.id,
        correct: isCorrect,
        points: pointsEarned,
        maxPoints: question.points
      })
    }

    const totalPossible = getTotalPossibleScore()
    const level = calculateLevel(totalScore, totalPossible)
    const levelDescription = getLevelDescription(level)
    const percentage = Math.round((totalScore / totalPossible) * 100)

    const correctAnswers = results.filter(r => r.correct).length
    const sectionScores = {
      reading: calculateSectionScore(results, 'R'),
      vocabulary: calculateSectionScore(results, 'V'),
      grammar: calculateSectionScore(results, 'G')
    }

    if (session?.user?.id) {
      try {
        await prisma.studentProfile.upsert({
          where: { userId: session.user.id },
          update: { 
            levelInitial: level,
            levelCurrent: level 
          },
          create: {
            userId: session.user.id,
            levelInitial: level,
            levelCurrent: level
          }
        })
      } catch (dbError) {
        console.error('Error updating student profile:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      score: totalScore,
      totalPossible,
      percentage,
      correctAnswers,
      totalQuestions: PLACEMENT_TEST_QUESTIONS.length,
      level,
      levelDescription,
      sectionScores,
      results
    })
  } catch (error) {
    console.error('Error processing placement test:', error)
    return NextResponse.json(
      { error: 'Failed to process test' },
      { status: 500 }
    )
  }
}

function calculateSectionScore(
  results: { questionId: string; correct: boolean; points: number; maxPoints: number }[],
  prefix: string
): { correct: number; total: number; pointsEarned: number; maxPoints: number; percentage: number } {
  const sectionResults = results.filter(r => r.questionId.startsWith(prefix))
  const correct = sectionResults.filter(r => r.correct).length
  const total = sectionResults.length
  const pointsEarned = sectionResults.reduce((sum, r) => sum + r.points, 0)
  const maxPoints = sectionResults.reduce((sum, r) => sum + r.maxPoints, 0)
  const percentage = maxPoints > 0 ? Math.round((pointsEarned / maxPoints) * 100) : 0
  
  return { correct, total, pointsEarned, maxPoints, percentage }
}
