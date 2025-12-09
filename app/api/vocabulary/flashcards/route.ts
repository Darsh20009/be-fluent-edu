import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateNextReview } from '@/lib/vocabulary-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const now = new Date()

    let words
    if (mode === 'review') {
      words = await prisma.word.findMany({
        where: {
          studentId: session.user.id,
          OR: [
            { nextReviewAt: { lte: now } },
            { nextReviewAt: null, known: false }
          ]
        },
        orderBy: { nextReviewAt: 'asc' },
        take: limit
      })
    } else if (mode === 'new') {
      words = await prisma.word.findMany({
        where: {
          studentId: session.user.id,
          reviewCount: 0
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } else {
      words = await prisma.word.findMany({
        where: { studentId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    }

    const totalWords = await prisma.word.count({
      where: { studentId: session.user.id }
    })

    const mastered = await prisma.word.count({
      where: {
        studentId: session.user.id,
        correctCount: { gte: 5 }
      }
    })

    const dueForReview = await prisma.word.count({
      where: {
        studentId: session.user.id,
        OR: [
          { nextReviewAt: { lte: now } },
          { nextReviewAt: null, known: false }
        ]
      }
    })

    const aggregation = await prisma.word.aggregate({
      where: { studentId: session.user.id },
      _sum: {
        correctCount: true,
        incorrectCount: true
      }
    })

    return NextResponse.json({
      cards: words.map((w) => ({
        id: w.id,
        word: w.englishWord,
        arabic: w.arabicMeaning,
        example: w.exampleSentence,
        imageUrl: w.imageUrl,
        audioUrl: w.pronunciationUrl,
        known: w.known,
        reviewCount: w.reviewCount,
        correctCount: w.correctCount,
        incorrectCount: w.incorrectCount,
        easeFactor: w.easeFactor,
        interval: w.interval,
        lastReviewedAt: w.lastReviewedAt,
        nextReviewAt: w.nextReviewAt,
        level: w.level,
        category: w.category
      })),
      stats: {
        totalWords,
        dueForReview,
        mastered,
        totalCorrect: aggregation._sum.correctCount || 0,
        totalIncorrect: aggregation._sum.incorrectCount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { wordId, quality, action } = body

    if (action === 'review') {
      const word = await prisma.word.findFirst({
        where: { id: wordId, studentId: session.user.id }
      })

      if (!word) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 })
      }

      const reviewData = calculateNextReview(
        quality,
        word.reviewCount,
        word.easeFactor,
        word.interval
      )

      const isCorrect = quality >= 3
      const now = new Date()

      await prisma.word.update({
        where: { id: wordId },
        data: {
          reviewCount: { increment: 1 },
          correctCount: isCorrect ? { increment: 1 } : word.correctCount,
          incorrectCount: !isCorrect ? { increment: 1 } : word.incorrectCount,
          easeFactor: reviewData.newEaseFactor,
          interval: reviewData.newInterval,
          lastReviewedAt: now,
          nextReviewAt: reviewData.nextReviewDate,
          known: word.correctCount + (isCorrect ? 1 : 0) >= 5,
          updatedAt: now
        }
      })

      return NextResponse.json({ 
        success: true,
        nextReview: reviewData.nextReviewDate,
        newInterval: reviewData.newInterval,
        newEaseFactor: reviewData.newEaseFactor
      })
    }

    if (action === 'add') {
      const { word, arabic, example, imageUrl, audioUrl, level, category } = body

      const existingWord = await prisma.word.findFirst({
        where: {
          studentId: session.user.id,
          englishWord: word
        }
      })

      if (existingWord) {
        return NextResponse.json({ error: 'Word already exists' }, { status: 400 })
      }

      const newWord = await prisma.word.create({
        data: {
          studentId: session.user.id,
          englishWord: word,
          arabicMeaning: arabic,
          exampleSentence: example,
          imageUrl,
          pronunciationUrl: audioUrl,
          level: level || 'BEGINNER',
          category,
          easeFactor: 2.5,
          interval: 1,
          nextReviewAt: new Date()
        }
      })

      return NextResponse.json({ success: true, word: newWord })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 })
  }
}
