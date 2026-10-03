import { z } from 'zod'
import { PLACEMENT_BANDS, levelForBand } from '@/lib/placement-bands'

export const placementQuestionGenerationRequestSchema = z.object({
  band: z.string().refine((value) => PLACEMENT_BANDS.includes(value), 'Invalid placement band.'),
  count: z.number().int().min(1).max(5),
  topic: z.string().trim().max(120).optional().default(''),
}).strict()

const questionDraftSchema = z.object({
  question: z.string().trim().min(8).max(400),
  questionAr: z.string().trim().min(2).max(500),
  options: z.array(z.string().trim().min(1).max(180)).length(4),
  correctAnswer: z.string().trim().min(1).max(180),
  explanation: z.string().trim().min(1).max(500),
  category: z.string().trim().min(2).max(40),
}).strict()

const questionResponseSchema = z.object({
  questions: z.array(questionDraftSchema),
}).strict()

export type PlacementQuestionDraft = z.infer<typeof questionDraftSchema>

export function parsePlacementQuestionDrafts(content: string, expectedCount: number): PlacementQuestionDraft[] {
  let value: unknown
  try {
    value = JSON.parse(content)
  } catch {
    throw new Error('INVALID_RESPONSE')
  }

  const parsed = questionResponseSchema.safeParse(value)
  if (!parsed.success || parsed.data.questions.length !== expectedCount) {
    throw new Error('INVALID_RESPONSE')
  }

  const normalizedQuestions = new Set<string>()
  for (const question of parsed.data.questions) {
    const normalizedOptions = question.options.map((option) => option.toLocaleLowerCase())
    if (
      new Set(normalizedOptions).size !== question.options.length
      || !question.options.some((option) => option === question.correctAnswer)
    ) {
      throw new Error('INVALID_RESPONSE')
    }

    const normalizedQuestion = question.question.toLocaleLowerCase()
    if (normalizedQuestions.has(normalizedQuestion)) {
      throw new Error('INVALID_RESPONSE')
    }
    normalizedQuestions.add(normalizedQuestion)
  }

  return parsed.data.questions
}

export function placementQuestionLevel(band: string) {
  return levelForBand(band)
}