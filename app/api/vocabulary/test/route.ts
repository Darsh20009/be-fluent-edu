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
    const mode = searchParams.get('mode') || 'mixed'
    const count = parseInt(searchParams.get('count') || '10')
    const source = searchParams.get('source') || 'my_words'
    const level = searchParams.get('level') || 'beginner'

    let testWords: Array<{ word: string; arabic: string; example: string }>

    if (source === 'my_words') {
      const userWords = await prisma.word.findMany({
        where: { studentId: session.user.id },
        take: count * 2,
        orderBy: { createdAt: 'desc' }
      })

      testWords = userWords.map((w) => ({
        word: w.englishWord,
        arabic: w.arabicMeaning,
        example: w.exampleSentence || ''
      }))
    } else {
      const allWords = getWordsByLevel(level as 'beginner' | 'intermediate' | 'advanced')
      testWords = allWords.slice(0, count * 2)
    }

    if (testWords.length < 4) {
      return NextResponse.json({ 
        error: 'Not enough words for a test. Please add more words first.',
        minRequired: 4,
        current: testWords.length
      }, { status: 400 })
    }

    const shuffled = testWords.sort(() => Math.random() - 0.5)
    const selectedWords = shuffled.slice(0, Math.min(count, shuffled.length))
    const allOptions = shuffled.map(w => w.arabic)

    const questions = selectedWords.map((word, index) => {
      const isMultipleChoice = mode === 'multiple_choice' || (mode === 'mixed' && Math.random() > 0.5)
      
      if (isMultipleChoice) {
        const wrongOptions = allOptions
          .filter(o => o !== word.arabic)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        
        const options = [...wrongOptions, word.arabic].sort(() => Math.random() - 0.5)
        
        return {
          id: `q-${index}`,
          type: 'multiple_choice',
          word: word.word,
          question: `ما معنى كلمة "${word.word}"؟`,
          questionEn: `What is the meaning of "${word.word}"?`,
          options,
          correctAnswer: word.arabic,
          example: word.example
        }
      } else {
        return {
          id: `q-${index}`,
          type: 'writing',
          word: word.word,
          question: `اكتب معنى كلمة "${word.word}" بالعربي`,
          questionEn: `Write the Arabic meaning of "${word.word}"`,
          correctAnswer: word.arabic,
          example: word.example
        }
      }
    })

    return NextResponse.json({
      questions,
      totalQuestions: questions.length,
      mode,
      source
    })
  } catch (error) {
    console.error('Error generating test:', error)
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { answers, questions } = body

    let correctCount = 0
    const results: Array<{
      word: string
      correct: boolean
      userAnswer: string
      correctAnswer: string
    }> = []

    for (const question of questions) {
      const userAnswer = answers[question.id] || ''
      let isCorrect = false

      if (question.type === 'multiple_choice') {
        isCorrect = userAnswer === question.correctAnswer
      } else {
        const normalize = (str: string) => 
          str.trim().toLowerCase().replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
        isCorrect = normalize(userAnswer) === normalize(question.correctAnswer)
      }

      if (isCorrect) correctCount++

      results.push({
        word: question.word,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer
      })

      const existingWord = await prisma.word.findFirst({
        where: {
          studentId: session.user.id,
          englishWord: question.word
        }
      })

      if (existingWord) {
        await prisma.word.update({
          where: { id: existingWord.id },
          data: {
            reviewCount: { increment: 1 },
            known: isCorrect && existingWord.reviewCount >= 3
          }
        })
      }
    }

    const score = Math.round((correctCount / questions.length) * 100)

    return NextResponse.json({
      score,
      correctCount,
      totalQuestions: questions.length,
      results,
      passed: score >= 70
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Failed to submit test' }, { status: 500 })
  }
}
