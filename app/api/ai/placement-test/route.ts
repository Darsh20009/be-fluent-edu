import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolvePlacementAccess } from '@/lib/placement-access'
import {
  PLACEMENT_BANDS,
  PLACEMENT_TEST_LENGTH,
  bandRank,
  determinePlacementBand,
  levelForBand,
  nextAdaptiveBand,
} from '@/lib/placement-bands'

export const runtime = 'nodejs'

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start') }),
  z.object({
    action: z.literal('answer'),
    attemptId: z.string().min(1).max(100),
    questionId: z.string().min(1).max(100),
    answer: z.string().min(1).max(500),
  }),
])

type SavedAnswer = {
  questionId: string
  answer: string
  correct: boolean
  band: string
}

type AttemptDetails = {
  version: 1
  currentQuestionId: string
  currentBand: string
  questionIds: string[]
  answers: SavedAnswer[]
}

function readAttemptDetails(value: string | null): AttemptDetails | null {
  if (!value) return null
  try {
    const details = JSON.parse(value) as Partial<AttemptDetails>
    if (
      details.version !== 1
      || typeof details.currentQuestionId !== 'string'
      || typeof details.currentBand !== 'string'
      || !Array.isArray(details.questionIds)
      || !Array.isArray(details.answers)
    ) return null
    return details as AttemptDetails
  } catch {
    return null
  }
}

function parseOptions(value: string | null): string[] | null {
  if (!value) return null
  try {
    const options = JSON.parse(value)
    if (
      !Array.isArray(options)
      || options.length !== 4
      || !options.every((option) => typeof option === 'string' && option.trim())
    ) return null
    return options
  } catch {
    return null
  }
}

function publicQuestion(question: {
  id: string
  question: string
  options: string | null
  level: string
  band: string
  category: string | null
}) {
  return {
    id: question.id,
    text: question.question,
    options: parseOptions(question.options) || [],
    level: question.level,
    band: question.band,
    category: question.category?.toLocaleLowerCase() || 'grammar',
  }
}

async function pickQuestion(band: string, excludeIds: string[]) {
  const sortedBands = [...PLACEMENT_BANDS].sort((left, right) =>
    Math.abs(bandRank(left) - bandRank(band)) - Math.abs(bandRank(right) - bandRank(band)),
  )

  for (const candidateBand of sortedBands) {
    const question = await prisma.placementQuestion.findMany({
      where: {
        testType: 'PLACEMENT',
        questionType: 'MCQ',
        band: candidateBand,
        correctAnswer: { not: null },
        options: { not: null },
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      select: {
        id: true,
        question: true,
        options: true,
        correctAnswer: true,
        level: true,
        band: true,
        category: true,
      },
      orderBy: { order: 'asc' },
    })
    const validQuestions = question.filter((item) =>
      typeof item.band === 'string'
      && parseOptions(item.options) !== null
      && typeof item.correctAnswer === 'string'
      && parseOptions(item.options)!.some((option) => option.trim() === item.correctAnswer!.trim()),
    )
    if (validQuestions.length) {
      const selected = validQuestions[Math.floor(Math.random() * validQuestions.length)]
      return { ...selected, band: candidateBand }
    }
  }
  return null
}

async function loadRecommendations(levelCode: string) {
  const level = await prisma.level.findUnique({
    where: { code: levelCode },
    select: { id: true },
  })
  if (!level) return []

  const packages = await prisma.package.findMany({
    where: { isActive: true, levelId: level.id },
    select: {
      id: true,
      title: true,
      titleAr: true,
      price: true,
      currency: true,
      lessonsCount: true,
      lessonsPerWeek: true,
      durationDays: true,
      subscriptionType: true,
    },
    orderBy: { price: 'asc' },
    take: 4,
  })
  return packages
}

export async function POST(request: NextRequest) {
  const placementAccess = await resolvePlacementAccess(request)
  if (placementAccess.response) return placementAccess.response
  if (!placementAccess.userId) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 })
  const studentId = placementAccess.userId

  let body: z.infer<typeof requestSchema>
  try {
    body = requestSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid placement-test request.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { age: true, gender: true, nationality: true, levelInitial: true },
    })
    if (
      !profile
      || !Number.isInteger(profile.age)
      || (profile.age ?? 0) < 5
      || (profile.age ?? 101) > 100
      || !['FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'].includes(profile.gender || '')
      || (profile.nationality || '').trim().length < 2
    ) {
      return NextResponse.json({ error: 'Complete your student profile before taking the placement test.' }, { status: 409 })
    }

    if (body.action === 'start') {
      const bankCount = await prisma.placementQuestion.count({
        where: {
          testType: 'PLACEMENT',
          questionType: 'MCQ',
          band: { not: null },
          correctAnswer: { not: null },
          options: { not: null },
        },
      })
      if (bankCount < PLACEMENT_TEST_LENGTH) {
        return NextResponse.json({
          error: 'The placement question bank is not ready. Ask an administrator to complete bank setup.',
        }, { status: 503 })
      }

      const firstBand = 'A2.2'
      const question = await pickQuestion(firstBand, [])
      if (!question) {
        return NextResponse.json({ error: 'No valid placement questions are available.' }, { status: 503 })
      }
      const attempt = await prisma.placementTestAttempt.create({
        data: {
          studentId,
          testType: 'PLACEMENT',
          score: 0,
          percentage: 0,
          details: JSON.stringify({
            version: 1,
            currentQuestionId: question.id,
            currentBand: question.band,
            questionIds: [question.id],
            answers: [],
          } satisfies AttemptDetails),
        },
      })
      return NextResponse.json({
        success: true,
        attemptId: attempt.id,
        question: publicQuestion(question),
        questionNumber: 1,
        total: PLACEMENT_TEST_LENGTH,
      })
    }

    const attempt = await prisma.placementTestAttempt.findFirst({
      where: {
        id: body.attemptId,
        studentId,
        testType: 'PLACEMENT',
      },
    })
    if (!attempt || attempt.completedAt) {
      return NextResponse.json({ error: 'This placement attempt is unavailable or already complete.' }, { status: 409 })
    }
    const details = readAttemptDetails(attempt.details)
    if (!details || details.currentQuestionId !== body.questionId) {
      return NextResponse.json({ error: 'The question does not match the active attempt.' }, { status: 409 })
    }
    const question = await prisma.placementQuestion.findFirst({
      where: {
        id: body.questionId,
        testType: 'PLACEMENT',
        questionType: 'MCQ',
      },
      select: { id: true, question: true, options: true, correctAnswer: true, level: true, band: true, category: true },
    })
    const options = parseOptions(question?.options || null)
    if (!question || !options || !question.correctAnswer || !question.band) {
      return NextResponse.json({ error: 'The active question is no longer available.' }, { status: 409 })
    }
    const selectedAnswer = body.answer.trim()
    if (!options.some((option) => option === selectedAnswer)) {
      return NextResponse.json({ error: 'Choose one of the listed answers.' }, { status: 400 })
    }

    const correct = selectedAnswer === question.correctAnswer.trim()
    const answers: SavedAnswer[] = [
      ...details.answers,
      { questionId: question.id, answer: selectedAnswer, correct, band: question.band },
    ]
    const askedIds = [...details.questionIds]
    const isComplete = answers.length === PLACEMENT_TEST_LENGTH

    if (!isComplete) {
      const nextBand = nextAdaptiveBand(question.band, correct)
      const nextQuestion = await pickQuestion(nextBand, askedIds)
      if (!nextQuestion) {
        return NextResponse.json({ error: 'There are not enough unused questions to finish this test.' }, { status: 503 })
      }
      await prisma.placementTestAttempt.update({
        where: { id: attempt.id },
        data: {
          score: answers.filter((answer) => answer.correct).length,
          percentage: answers.filter((answer) => answer.correct).length / PLACEMENT_TEST_LENGTH * 100,
          details: JSON.stringify({
            version: 1,
            currentQuestionId: nextQuestion.id,
            currentBand: nextQuestion.band,
            questionIds: [...askedIds, nextQuestion.id],
            answers,
          } satisfies AttemptDetails),
        },
      })
      return NextResponse.json({
        success: true,
        question: publicQuestion(nextQuestion),
        questionNumber: answers.length + 1,
        total: PLACEMENT_TEST_LENGTH,
        lastAnswerCorrect: correct,
      })
    }

    const score = answers.filter((answer) => answer.correct).length
    const percentage = Math.round(score / PLACEMENT_TEST_LENGTH * 100)
    const resultBand = determinePlacementBand(answers)
    const resultLevel = levelForBand(resultBand) || 'A1'
    const level = await prisma.level.findUnique({ where: { code: resultLevel }, select: { id: true } })

    await prisma.$transaction(async (tx) => {
      await tx.placementTestAttempt.update({
        where: { id: attempt.id },
        data: {
          score,
          percentage,
          levelResult: resultLevel,
          details: JSON.stringify({
            version: 1,
            questionIds: askedIds,
            answers,
            resultBand,
          }),
          completedAt: new Date(),
        },
      })
      await tx.studentProfile.upsert({
        where: { userId: studentId },
        create: {
          userId: studentId,
          levelInitial: profile.levelInitial || resultLevel,
          targetLevel: resultLevel,
          recommendedLevelId: level?.id || null,
          placementTestScore: score,
          placementTestPercentage: percentage,
        },
        update: {
          targetLevel: resultLevel,
          recommendedLevelId: level?.id || null,
          placementTestScore: score,
          placementTestPercentage: percentage,
        },
      })
    })

    const recommendedPackages = await loadRecommendations(resultLevel)
    return NextResponse.json({
      success: true,
      level: resultLevel,
      band: resultBand,
      score,
      total: PLACEMENT_TEST_LENGTH,
      percentage,
      recommendedPackages,
    })
  } catch (error) {
    console.error('Saved-bank placement test failed', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'The placement test could not be saved. Please try again.' }, { status: 500 })
  }
}