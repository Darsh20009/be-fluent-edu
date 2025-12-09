import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!openai) {
      return NextResponse.json({ error: 'Grammar check service is not configured' }, { status: 503 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert English grammar checker for English learning students. Analyze the text and provide detailed grammar corrections. Return JSON with this format: { 'errors': [{ 'error': string, 'correction': string, 'explanation': string, 'type': string }], 'overallScore': number, 'summary': string }"
        },
        {
          role: "user",
          content: `Check this student's English text for grammar errors:\n\n${text}`
        }
      ],
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error checking grammar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
