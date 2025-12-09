import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { textConversationQuestions } from '@/lib/conversation-scenarios'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    let conversations = await prisma.textConversation.findMany({
      where: {
        isPublished: true,
        ...(level && { level })
      },
      orderBy: { order: 'asc' }
    })

    if (conversations.length === 0) {
      const conversationsToCreate = textConversationQuestions.map((conv, index) => ({
        title: conv.title,
        titleAr: conv.titleAr,
        description: conv.description,
        descriptionAr: conv.descriptionAr,
        level: conv.level,
        questions: JSON.stringify(conv.questions),
        order: index,
        isPublished: true
      }))

      for (const conv of conversationsToCreate) {
        await prisma.textConversation.create({ data: conv })
      }

      conversations = await prisma.textConversation.findMany({
        where: {
          isPublished: true,
          ...(level && { level })
        },
        orderBy: { order: 'asc' }
      })
    }

    const conversationsWithQuestions = conversations.map((conv: any) => ({
      ...conv,
      questions: JSON.parse(conv.questions)
    }))

    return NextResponse.json(conversationsWithQuestions)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

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
    const { conversationId, answers } = body

    const conversation = await prisma.textConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const questions = JSON.parse(conversation.questions)
    let score = 0

    const evaluatedAnswers = answers.map((answer: { questionId: number; text: string }) => {
      const question = questions.find((q: any) => q.id === answer.questionId)
      if (!question) return { ...answer, correct: false, matchedKeywords: [] }

      const answerLower = answer.text.toLowerCase()
      const matchedKeywords = question.keywords.filter((kw: string) => 
        answerLower.includes(kw.toLowerCase())
      )

      const isCorrect = matchedKeywords.length >= Math.min(2, question.keywords.length)
      if (isCorrect) score++

      return {
        ...answer,
        correct: isCorrect,
        matchedKeywords,
        sampleAnswer: question.sampleAnswer,
        sampleAnswerAr: question.sampleAnswerAr
      }
    })

    const attempt = await prisma.textConversationAttempt.create({
      data: {
        studentId: user.id,
        conversationId,
        answers: JSON.stringify(evaluatedAnswers),
        score,
        totalQuestions: questions.length
      }
    })

    return NextResponse.json({
      ...attempt,
      evaluatedAnswers,
      percentage: Math.round((score / questions.length) * 100)
    })
  } catch (error) {
    console.error('Error submitting conversation:', error)
    return NextResponse.json({ error: 'Failed to submit conversation' }, { status: 500 })
  }
}
