import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWordsByLevel } from '@/lib/words-database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = (searchParams.get('level') || 'beginner') as 'beginner' | 'intermediate' | 'advanced'
    const count = parseInt(searchParams.get('count') || '5')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let dailyWords = await prisma.dailyWord.findMany({
      where: {
        dateShown: {
          gte: today
        },
        level: level.toUpperCase()
      },
      orderBy: { order: 'asc' },
      take: count
    })

    if (dailyWords.length < count) {
      const words = getWordsByLevel(level)
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
      
      const shuffled = [...words].sort((a, b) => {
        const hashA = (seed * words.indexOf(a) + 1) % 10000
        const hashB = (seed * words.indexOf(b) + 1) % 10000
        return hashA - hashB
      })

      const selectedWords = shuffled.slice(0, count)
      
      await prisma.dailyWord.deleteMany({
        where: {
          dateShown: { lt: today },
          level: level.toUpperCase()
        }
      })

      for (let i = 0; i < selectedWords.length; i++) {
        const w = selectedWords[i]
        await prisma.dailyWord.create({
          data: {
            englishWord: w.word,
            arabicMeaning: w.arabic,
            exampleSentence: w.example,
            level: level.toUpperCase(),
            dateShown: today,
            order: i
          }
        })
      }

      dailyWords = await prisma.dailyWord.findMany({
        where: {
          dateShown: { gte: today },
          level: level.toUpperCase()
        },
        orderBy: { order: 'asc' },
        take: count
      })
    }

    const userWords = await prisma.word.findMany({
      where: {
        studentId: session.user.id,
        englishWord: { in: dailyWords.map(w => w.englishWord) }
      },
      select: { englishWord: true, known: true }
    })

    const knownWordsMap = new Map(userWords.map((w: { englishWord: string; known: boolean }) => [w.englishWord, w.known]))

    return NextResponse.json({
      words: dailyWords.map((w: { id: string; englishWord: string; arabicMeaning: string; exampleSentence: string | null; imageUrl: string | null; pronunciationUrl: string | null; level: string }) => ({
        id: w.id,
        word: w.englishWord,
        arabic: w.arabicMeaning,
        example: w.exampleSentence,
        imageUrl: w.imageUrl,
        audioUrl: w.pronunciationUrl,
        level: w.level,
        isLearned: knownWordsMap.get(w.englishWord) || false
      })),
      date: today.toISOString()
    })
  } catch (error) {
    console.error('Error fetching daily words:', error)
    return NextResponse.json({ error: 'Failed to fetch daily words' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { word, arabic, example, action } = body

    if (action === 'learn') {
      const existingWord = await prisma.word.findFirst({
        where: {
          studentId: session.user.id,
          englishWord: word
        }
      })

      if (existingWord) {
        await prisma.word.update({
          where: { id: existingWord.id },
          data: { 
            known: true,
            reviewCount: { increment: 1 }
          }
        })
      } else {
        await prisma.word.create({
          data: {
            studentId: session.user.id,
            englishWord: word,
            arabicMeaning: arabic,
            exampleSentence: example,
            known: true,
            reviewCount: 1
          }
        })
      }

      return NextResponse.json({ success: true, message: 'Word marked as learned' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating daily word:', error)
    return NextResponse.json({ error: 'Failed to update word' }, { status: 500 })
  }
}
