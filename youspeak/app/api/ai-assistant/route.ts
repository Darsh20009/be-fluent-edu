import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const { message, conversationHistory } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = `You are a helpful English learning assistant for Arabic speakers. Your name is "YouSpeak AI".

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

Current student: ${session.user.name || 'Student'}`

    const sanitizedHistory = Array.isArray(conversationHistory)
      ? conversationHistory
          .filter((msg: any) => 
            msg && 
            typeof msg === 'object' &&
            (msg.role === 'user' || msg.role === 'assistant') &&
            typeof msg.content === 'string'
          )
          .slice(-10)
          .map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content.slice(0, 2000)
          }))
      : []

    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      { role: 'system', content: systemPrompt },
      ...sanitizedHistory,
      { role: 'user', content: message.slice(0, 2000) }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1024,
    })

    const aiResponse = response.choices[0].message.content

    return NextResponse.json({
      message: aiResponse,
      role: 'assistant'
    })
  } catch (error) {
    console.error('AI Assistant error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
