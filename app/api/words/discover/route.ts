import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWordsByLevel, getWordsByCategoryAndLevel, WordItem } from '@/lib/words-database'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = (searchParams.get('level') || 'beginner') as 'beginner' | 'intermediate' | 'advanced'
    const category = searchParams.get('category')

    const existingWords = await prisma.word.findMany({
      where: { studentId: session.user.id },
      select: { englishWord: true, known: true }
    })

    const seenWords = new Set(existingWords.map(w => w.englishWord.toLowerCase()))
    const knownCount = existingWords.filter(w => w.known).length
    
    let allWords: WordItem[]
    if (category && category !== 'all') {
      allWords = getWordsByCategoryAndLevel(category, level)
    } else {
      allWords = getWordsByLevel(level)
    }
    
    const newWords = allWords.filter(w => !seenWords.has(w.word.toLowerCase()))
    
    const shuffled = newWords.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 10)

    return NextResponse.json({ 
      words: selected, 
      level,
      category: category || 'all',
      totalAvailable: allWords.length,
      newWordsCount: newWords.length,
      knownCount
    })
  } catch (error) {
    console.error('Error fetching discover words:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { word, arabic, example, known, imageUrl, category } = await request.json()

    const existingWord = await prisma.word.findFirst({
      where: {
        studentId: session.user.id,
        englishWord: word
      }
    })

    if (!existingWord) {
      await prisma.word.create({
        data: {
          studentId: session.user.id,
          englishWord: word,
          arabicMeaning: arabic,
          exampleSentence: example,
          imageUrl: imageUrl || null,
          known: known,
          reviewCount: known ? 1 : 0
        }
      })
    } else {
      await prisma.word.update({
        where: { id: existingWord.id },
        data: { 
          known: known, 
          imageUrl: imageUrl || existingWord.imageUrl,
          reviewCount: known ? { increment: 1 } : existingWord.reviewCount 
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving word:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
