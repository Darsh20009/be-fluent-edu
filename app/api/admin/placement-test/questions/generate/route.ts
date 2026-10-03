import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { isNextResponse, requireAdmin } from '@/lib/auth-helpers'
import {
  parsePlacementQuestionDrafts,
  placementQuestionGenerationRequestSchema,
  placementQuestionLevel,
} from '@/lib/placement-question-generation'

export const runtime = 'nodejs'

const questionJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          questionAr: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'string' },
          explanation: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['question', 'questionAr', 'options', 'correctAnswer', 'explanation', 'category'],
      },
    },
  },
  required: ['questions'],
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (isNextResponse(admin)) return admin

  const parsed = placementQuestionGenerationRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'أدخل نطاقًا صحيحًا وعددًا من 1 إلى 5.' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'خدمة توليد الأسئلة غير مهيأة.' }, { status: 503 })
  }

  const level = placementQuestionLevel(parsed.data.band)
  if (!level) return NextResponse.json({ error: 'نطاق المستوى غير صالح.' }, { status: 400 })

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_completion_tokens: 2200,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'placement_question_drafts',
          strict: true,
          schema: questionJsonSchema,
        },
      },
      messages: [
        {
          role: 'system',
          content: [
            'Create English-learning placement-test multiple-choice question drafts for adult and teenage learners.',
            'Return the exact requested number of distinct questions as JSON matching the schema.',
            'Each question must match the supplied CEFR level and placement band, have exactly four distinct options, and exactly one correct answer copied verbatim from those options.',
            'Use clear English for question and options, provide a faithful Arabic translation of the question, and explain briefly in English why the answer is correct.',
            'Do not include answer labels or numbering in the option text. Do not invent citations or factual claims.',
            'Use a concise category such as Grammar, Vocabulary, Reading, or Functional Language.',
          ].join(' '),
        },
        {
          role: 'user',
          content: JSON.stringify({
            level,
            band: parsed.data.band,
            count: parsed.data.count,
            topic: parsed.data.topic || 'Choose a suitable mix of grammar and vocabulary for this band.',
          }),
        },
      ],
    }, { signal: AbortSignal.timeout(25_000) })

    const content = completion.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'لم يرجع المزوّد أسئلة قابلة للمراجعة.' }, { status: 502 })
    const questions = parsePlacementQuestionDrafts(content, parsed.data.count)
    return NextResponse.json({
      drafts: questions.map((question) => ({
        ...question,
        questionType: 'MCQ',
        points: 1,
        level,
        band: parsed.data.band,
        testType: 'PLACEMENT',
      })),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error(
      'Placement question generation failed',
      error instanceof OpenAI.APIError ? error.status : error instanceof Error ? error.name : 'Unknown error',
    )
    return NextResponse.json({ error: 'تعذر توليد الأسئلة الآن. حاول مرة أخرى.' }, { status: 502 })
  }
}