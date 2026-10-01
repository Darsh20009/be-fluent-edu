import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createThanarahCompletion, parseThanarahJson, ThanarahError } from '@/lib/thanarah'

interface GrammarCheckResult {
  errors: Array<{
    error: string
    correction: string
    explanation: string
    type: string
  }>
  overallScore: number
  summary: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.THANARAH_API_KEY) {
      return NextResponse.json({ error: 'Grammar check service is not configured' }, { status: 503 })
    }

    const body = await request.json().catch(() => null)
    const text = typeof body?.text === 'string' ? body.text.trim() : ''

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text is too long' }, { status: 400 })
    }

    const raw = await createThanarahCompletion([
      {
        role: 'system',
        content: 'You are an expert English grammar checker for English learners. Analyze the text and return one valid JSON object only, with keys: errors (array of objects with error, correction, explanation, and type strings), overallScore (number from 0 to 100), and summary (string).',
      },
      {
        role: 'user',
        content: `Check this student's English text for grammar errors:\n\n${text}`,
      },
    ], { maxTokens: 1600 })

    const result = parseThanarahJson<GrammarCheckResult>(raw)
    const validResult =
      result &&
      Array.isArray(result.errors) &&
      Number.isFinite(result.overallScore) &&
      typeof result.summary === 'string' &&
      result.errors.every((item) =>
        item &&
        typeof item.error === 'string' &&
        typeof item.correction === 'string' &&
        typeof item.explanation === 'string' &&
        typeof item.type === 'string',
      )

    if (!validResult) {
      throw new ThanarahError('INVALID_RESPONSE')
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ThanarahError && error.code === 'MISSING_API_KEY') {
      return NextResponse.json({ error: 'Grammar check service is not configured' }, { status: 503 })
    }
    console.error(
      'Grammar check request failed',
      error instanceof ThanarahError ? { code: error.code, status: error.status } : undefined,
    )
    return NextResponse.json({ error: 'Failed to check grammar' }, { status: 502 })
  }
}
