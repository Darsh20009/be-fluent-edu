import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { words } = await request.json()

    if (!words || !Array.isArray(words)) {
      return NextResponse.json({ error: 'Invalid words data' }, { status: 400 })
    }

    const createdWords = []

    for (const word of words) {
      const { englishWord, arabicMeaning, exampleSentence } = word

      if (!englishWord) continue

      let translation = arabicMeaning

      if (!translation) {
        try {
          const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(englishWord)}`
          )

          if (response.ok) {
            const data = await response.json()
            translation = data[0]?.[0]?.[0] || englishWord
          } else {
            translation = englishWord
          }
        } catch (error) {
          console.error('Translation failed for:', englishWord)
          translation = englishWord
        }
      }

      const created = await prisma.word.create({
        data: {
          studentId: session.user.id,
          englishWord,
          arabicMeaning: translation,
          exampleSentence: exampleSentence || null,
        },
      })

      createdWords.push({
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      })
    }

    return NextResponse.json({ 
      success: true, 
      count: createdWords.length,
      words: createdWords 
    })
  } catch (error) {
    console.error('Error importing words:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
