import { createHash } from 'node:crypto'
import { z } from 'zod'
import { recommendationTypes } from '@/lib/phase9/engine'

export const aiSuggestionDraftSchema = z.object({
  proposal: z.object({
    type: z.enum(recommendationTypes),
    title: z.string().trim().min(1).max(120).refine((value) => !/https?:\/\/|www\./i.test(value)),
    reason: z.string().trim().min(1).max(300).refine((value) => !/https?:\/\/|www\./i.test(value)),
    skillCode: z.string().trim().min(1).max(80).nullable(),
    resourceId: z.string().trim().min(1).max(180).nullable(),
    levelId: z.string().trim().min(1).max(180).nullable(),
    stageId: z.string().trim().min(1).max(180).nullable(),
  }).strict(),
  sourceSignalKeys: z.array(z.string().trim().min(1).max(500)).max(20),
  evidenceCycleKey: z.string().trim().min(1).max(500),
}).strict()

export type AiSuggestionDraft = z.infer<typeof aiSuggestionDraftSchema>

export function parseAiSuggestionDraft(value: string) {
  try {
    return aiSuggestionDraftSchema.safeParse(JSON.parse(value))
  } catch {
    return { success: false as const, error: new Error('Invalid saved AI proposal draft') }
  }
}

export async function loadScopedAiProposalDrafts(input: {
  teacherId: string
  studentId: string
  authorize: () => Promise<boolean>
  loadRecords: (scope: { teacherId: string; studentId: string; limit: 50 }) => Promise<Array<{
    id: string
    teacherId: string
    studentId: string
    type: string
    status: string
    draftJson: string
    reason: string
    createdAt: Date
  }>>
}): Promise<
  { kind: 'FORBIDDEN' }
  | { kind: 'OK'; items: Array<{
    id: string
    studentId: string
    type: 'AI_RECOMMENDATION'
    status: 'PENDING_REVIEW'
    proposal: AiSuggestionDraft['proposal']
    reason: string
    createdAt: Date
  }> }
> {
  if (!await input.authorize()) return { kind: 'FORBIDDEN' }
  const records = await input.loadRecords({
    teacherId: input.teacherId,
    studentId: input.studentId,
    limit: 50,
  })
  const items = records
    .filter((record) => record.teacherId === input.teacherId
      && record.studentId === input.studentId
      && record.type === 'AI_RECOMMENDATION'
      && record.status === 'PENDING_REVIEW')
    .flatMap((record) => {
      const parsed = parseAiSuggestionDraft(record.draftJson)
      return parsed.success ? [{
        id: record.id,
        studentId: record.studentId,
        type: 'AI_RECOMMENDATION' as const,
        status: 'PENDING_REVIEW' as const,
        proposal: parsed.data.proposal,
        reason: parsed.data.proposal.reason,
        createdAt: record.createdAt,
      }] : []
    })
  if (!await input.authorize()) return { kind: 'FORBIDDEN' }
  return { kind: 'OK', items }
}

function canonical(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function aiRecommendationData(input: {
  suggestionId: string
  studentId: string
  approvedById: string
  draft: AiSuggestionDraft
  skillId: string | null
}) {
  const proposal = input.draft.proposal
  const dedupeKey = `teacher-ai:${sha256([
    input.studentId,
    proposal.type,
    canonical(proposal.title),
    canonical(proposal.skillCode || ''),
    proposal.resourceId || '',
    proposal.levelId || '',
    proposal.stageId || '',
  ].join('|'))}`
  return {
    studentId: input.studentId,
    levelId: proposal.levelId,
    stageId: proposal.stageId,
    type: proposal.type,
    title: proposal.title,
    reason: proposal.reason,
    priority: 50,
    skillId: input.skillId,
    resourceId: proposal.resourceId,
    dedupeKey,
    evidenceCycleKey: input.draft.evidenceCycleKey,
    dedupeCycle: 1,
    sourceSignalKeysJson: JSON.stringify(input.draft.sourceSignalKeys),
    payloadJson: JSON.stringify({
      origin: 'TEACHER_REVIEWED_THANARAH_PROPOSAL',
      suggestionId: input.suggestionId,
      approvedById: input.approvedById,
    }),
    status: 'PENDING',
    expiresAt: null,
  }
}

export interface AiSuggestionReviewRepository {
  isAuthorized(): Promise<boolean>
  findSuggestion(): Promise<{
    id: string
    studentId: string
    teacherId: string
    type: string
    status: string
    draftJson: string
  } | null>
  findRecommendation(dedupeKey: string): Promise<{ id: string } | null>
  createRecommendation(data: ReturnType<typeof aiRecommendationData>): Promise<{ id: string }>
  transitionSuggestion(from: 'PENDING_REVIEW', to: 'APPROVED' | 'REJECTED', reviewerId: string, at: Date): Promise<number>
  materializationDetails(
    draft: AiSuggestionDraft,
  ): Promise<{ levelId: string | null; stageId: string | null; skillId: string | null; resourceValid: boolean }>
}

class ReviewAbort extends Error {
  constructor(public readonly kind: 'FORBIDDEN' | 'CONFLICT' | 'INVALID_DRAFT') {
    super(kind)
  }
}

/**
 * Must be called inside the caller's database transaction. The unique AI
 * recommendation key is the durable duplicate guard; the conditional status
 * update and recommendation insert commit or roll back together.
 */
export async function reviewGeneratedSuggestionInTransaction(input: {
  repository: AiSuggestionReviewRepository
  suggestionId: string
  reviewerId: string
  decision: 'APPROVE' | 'REJECT'
  now?: Date
}) {
  const repo = input.repository
  if (!await repo.isAuthorized()) throw new ReviewAbort('FORBIDDEN')
  const suggestion = await repo.findSuggestion()
  if (!suggestion || suggestion.id !== input.suggestionId || suggestion.type !== 'AI_RECOMMENDATION') {
    return { kind: 'NOT_FOUND' as const }
  }
  if (suggestion.status !== 'PENDING_REVIEW') return { kind: 'CONFLICT' as const }

  const now = input.now || new Date()
  if (input.decision === 'REJECT') {
    const changed = await repo.transitionSuggestion('PENDING_REVIEW', 'REJECTED', input.reviewerId, now)
    if (changed !== 1) return { kind: 'CONFLICT' as const }
    return { kind: 'REJECTED' as const, id: suggestion.id, status: 'REJECTED' as const }
  }

  const parsed = parseAiSuggestionDraft(suggestion.draftJson)
  if (!parsed.success) throw new ReviewAbort('INVALID_DRAFT')
  const details = await repo.materializationDetails(parsed.data)
  if (!details.resourceValid) throw new ReviewAbort('INVALID_DRAFT')
  const draft = {
    ...parsed.data,
    proposal: {
      ...parsed.data.proposal,
      levelId: details.levelId,
      stageId: details.stageId,
    },
  }
  const recommendationData = aiRecommendationData({
    suggestionId: suggestion.id,
    studentId: suggestion.studentId,
    approvedById: input.reviewerId,
    draft,
    skillId: details.skillId,
  })
  if (await repo.findRecommendation(recommendationData.dedupeKey)) return { kind: 'DUPLICATE' as const }
  const recommendation = await repo.createRecommendation(recommendationData)
  if (!await repo.isAuthorized()) throw new ReviewAbort('FORBIDDEN')
  const changed = await repo.transitionSuggestion('PENDING_REVIEW', 'APPROVED', input.reviewerId, now)
  if (changed !== 1) throw new ReviewAbort('CONFLICT')
  return {
    kind: 'APPROVED' as const,
    id: suggestion.id,
    status: 'APPROVED' as const,
    materialized: true as const,
    recommendationId: recommendation.id,
  }
}

export function reviewAbortKind(error: unknown) {
  return error instanceof ReviewAbort ? error.kind : null
}