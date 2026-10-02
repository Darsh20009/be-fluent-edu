import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isNextResponse, requireAnyPermission } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { adminPendingAiSuggestions, reviewAiSuggestionAsAdmin } from '@/lib/phase9/staff-service'
import { validationError } from '@/lib/phase5'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
}).strict()
const decisionSchema = z.object({
  suggestionId: z.string().trim().min(1).max(180),
  decision: z.enum(['APPROVE', 'REJECT']),
}).strict()
const permissions = ['admin.manageLearningIntelligence', 'manager.manageLearningIntelligence'] as const

export async function GET(request: NextRequest) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAnyPermission(permissions)
  if (isNextResponse(access)) return access
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()))
  if (!parsed.success) return validationError(parsed.error)
  return NextResponse.json({ items: await adminPendingAiSuggestions(parsed.data.limit) })
}

export async function POST(request: NextRequest) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAnyPermission(permissions)
  if (isNextResponse(access)) return access
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const result = await reviewAiSuggestionAsAdmin(access.userId, parsed.data.suggestionId, parsed.data.decision)
  if (result.kind === 'NOT_FOUND') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Pending AI proposal not found' } }, { status: 404 })
  }
  if (result.kind === 'CONFLICT' || result.kind === 'DUPLICATE') {
    return NextResponse.json({ ok: false, error: { code: 'ALREADY_PROCESSED', message: 'The proposal is no longer pending review or an equivalent recommendation exists' } }, { status: 409 })
  }
  if (result.kind === 'INVALID_DRAFT') {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_DRAFT', message: 'The saved proposal is invalid or no longer matches the published learning content' } }, { status: 409 })
  }
  return NextResponse.json(result)
}