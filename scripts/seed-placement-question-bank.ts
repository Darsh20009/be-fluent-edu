import { prisma } from '../lib/prisma'
import { createThanarahCompletion, parseThanarahJson, ThanarahError } from '../lib/thanarah'
import {
  PLACEMENT_BANDS,
  targetQuestionsForBand,
} from '../lib/placement-bands'

type GeneratedQuestion = {
  question: string
  options: string[]
  correctAnswer: string
  category: 'GRAMMAR' | 'VOCABULARY' | 'READING'
  explanation?: string
}

const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')

function isGeneratedQuestion(value: unknown): value is GeneratedQuestion {
  if (!value || typeof value !== 'object') return false
  const question = value as Partial<GeneratedQuestion>
  return typeof question.question === 'string'
    && question.question.trim().length >= 10
    && Array.isArray(question.options)
    && question.options.length === 4
    && question.options.every((option) => typeof option === 'string' && option.trim().length > 0)
    && new Set(question.options.map(normalize)).size === 4
    && typeof question.correctAnswer === 'string'
    && question.options.some((option) => normalize(option) === normalize(question.correctAnswer!))
    && ['GRAMMAR', 'VOCABULARY', 'READING'].includes(question.category || '')
}

async function generateQuestions(band: string, count: number, existing: Set<string>) {
  const level = band.split('.')[0]
  const accepted: GeneratedQuestion[] = []
  const seen = new Set(existing)

  for (let attempt = 0; attempt < 4 && accepted.length < count; attempt += 1) {
    const remaining = count - accepted.length
    const messages = [
      {
        role: 'system' as const,
        content: [
          'You write rigorous, fair English proficiency assessment items for CEFR learners.',
          'Return valid JSON only. Do not include markdown fences or commentary.',
          'Every multiple-choice question must have exactly four distinct options and one unambiguous correct answer.',
          'Do not reuse questions, options, or examples from earlier items in the same response.',
          'Use English only, natural modern language, and level-appropriate vocabulary and grammar.',
          'Avoid cultural assumptions, trick questions, personal data, copyrighted excerpts, and ambiguous answers.',
        ].join(' '),
      },
      {
        role: 'user' as const,
        content: JSON.stringify({
          task: `Generate exactly ${remaining} new placement-test questions for CEFR band ${band} (${level}).`,
          constraints: {
            categories: ['GRAMMAR', 'VOCABULARY', 'READING'],
            fourOptions: true,
            correctAnswerMustExactlyMatchOneOption: true,
            questionLength: 'One clear question or short reading passage with a question',
          },
          responseShape: {
            questions: [{
              question: 'Question text',
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
              correctAnswer: 'Exact text of the correct option',
              category: 'GRAMMAR',
              explanation: 'Brief reason the answer is correct',
            }],
          },
        }),
      },
    ]
    const raw = await createThanarahCompletion(messages, { temperature: 0.25, maxTokens: 6500 })
    const payload = parseThanarahJson<{ questions?: unknown }>(raw)
    const candidates = Array.isArray(payload.questions) ? payload.questions : []
    for (const candidate of candidates) {
      if (!isGeneratedQuestion(candidate)) continue
      const key = normalize(candidate.question)
      if (seen.has(key)) continue
      seen.add(key)
      accepted.push({
        ...candidate,
        question: candidate.question.trim(),
        options: candidate.options.map((option) => option.trim()),
        correctAnswer: candidate.correctAnswer.trim(),
        explanation: candidate.explanation?.trim(),
      })
      if (accepted.length >= count) break
    }
  }

  if (accepted.length !== count) {
    throw new Error(`Could not generate ${count} valid unique questions for ${band}; got ${accepted.length}. Rerun to continue.`)
  }
  return accepted
}

async function main() {
  if (!process.env.THANARAH_API_KEY) {
    throw new Error('THANARAH_API_KEY is not available to the seed process.')
  }

  const allExisting = await prisma.placementQuestion.findMany({
    where: { testType: 'PLACEMENT' },
    select: { question: true },
  })
  const seenAcrossBands = new Set(allExisting.map((item) => normalize(item.question)))
  if (seenAcrossBands.size !== allExisting.length) {
    throw new Error('Duplicate placement question text already exists. No data was removed.')
  }

  let savedTotal = 0
  for (let index = 0; index < PLACEMENT_BANDS.length; index += 1) {
    const band = PLACEMENT_BANDS[index]
    const target = targetQuestionsForBand(index)
    const existing = await prisma.placementQuestion.findMany({
      where: { testType: 'PLACEMENT', band },
      select: { question: true },
    })
    if (existing.length > target) {
      throw new Error(`${band} has ${existing.length} saved questions, above its target of ${target}. No data was removed.`)
    }
    const missing = target - existing.length
    if (!missing) continue

    const questions = await generateQuestions(
      band,
      missing,
      seenAcrossBands,
    )
    await prisma.placementQuestion.createMany({
      data: questions.map((item, itemIndex) => ({
        question: item.question,
        questionType: 'MCQ',
        options: JSON.stringify(item.options),
        correctAnswer: item.correctAnswer,
        explanation: item.explanation || null,
        points: 1,
        order: existing.length + itemIndex,
        level: band.split('.')[0],
        band,
        testType: 'PLACEMENT',
        category: item.category,
      })),
    })
    for (const question of questions) seenAcrossBands.add(normalize(question.question))
    savedTotal += questions.length
    console.log(`${band}: saved ${questions.length}; target ${target}`)
  }

  const counts = await Promise.all(PLACEMENT_BANDS.map(async (band, index) => {
    const count = await prisma.placementQuestion.count({ where: { testType: 'PLACEMENT', band } })
    return { band, count, target: targetQuestionsForBand(index) }
  }))
  const count = counts.reduce((total, item) => total + item.count, 0)
  const incomplete = counts.filter((item) => item.count !== item.target)
  if (incomplete.length) {
    throw new Error(`Question-bank verification failed: ${JSON.stringify(incomplete)}`)
  }
  console.log(`Verified ${count} saved questions across ${PLACEMENT_BANDS.length} CEFR bands; added ${savedTotal} this run.`)
}

main()
  .catch((error) => {
    const safeMessage = error instanceof ThanarahError
      ? `${error.code}${error.status ? ` (HTTP ${error.status})` : ''}`
      : error instanceof Error ? error.message : 'Unknown error'
    console.error('Placement question bank seeding failed:', safeMessage)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })