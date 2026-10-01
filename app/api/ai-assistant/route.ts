import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createThanarahCompletion, ThanarahError } from '@/lib/thanarah'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

function isConversationMessage(value: unknown): value is ConversationMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  )
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.THANARAH_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const body = await req.json().catch(() => null)
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const conversationHistory: unknown = body?.conversationHistory

    if (!message || message.length > 2000) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = `You are a helpful English learning assistant for Arabic speakers. Your name is "Be Fluent AI".

Your role:
- Help students learn English vocabulary, grammar, and conversation skills
- Answer questions about English language in both English and Arabic
- Correct grammar mistakes and explain the corrections
- Provide examples and practice exercises
- Be encouraging and patient
- Respond in both English and Arabic when helpful

Guidelines:
- Keep responses clear and educational
- Use simple English for beginners
- Provide Arabic translations when explaining new concepts
- Give practical examples
- Encourage the student to practice
`

    const sanitizedHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter(isConversationMessage)
          .slice(-10)
          .map((historyMessage) => ({
            role: historyMessage.role,
            content: historyMessage.content.slice(0, 2000)
          }))
      : []

    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message }
    ]

    const aiResponse = await createThanarahCompletion(messages, { maxTokens: 1024 })

    return NextResponse.json({
      message: aiResponse,
      role: 'assistant'
    })
  } catch (error) {
    if (error instanceof ThanarahError && error.code === 'MISSING_API_KEY') {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }
    console.error(
      'AI Assistant request failed',
      error instanceof ThanarahError ? { code: error.code, status: error.status } : undefined,
    )
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 502 })
  }
}
