import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { phase9DatabaseGuard, progressTodayLearning } from '@/lib/phase9/student-service'

const progressSchema = z.object({
  action: z.enum(['START_STEP', 'COMPLETE_STEP', 'SKIP_STEP', 'PAUSE', 'RESUME']),
  stepIndex: z.number().int().min(0).max(4).optional(),
}).strict().superRefine((value, context) => {
  if (['START_STEP', 'COMPLETE_STEP', 'SKIP_STEP'].includes(value.action) && value.stepIndex === undefined) {
    context.addIssue({ code: 'custom', path: ['stepIndex'], message: 'A step index is required for this action.' })
  }
})

export async function POST(request: Request) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const parsed = progressSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid progress request.' } }, { status: 400 })
  const result = await progressTodayLearning(access.userId, parsed.data)
  if ('error' in result) {
    const code = result.error || 'INVALID_TRANSITION'
    const status = code === 'NOT_FOUND' ? 404
      : code === 'RECOMMENDATION_EXPIRED' ? 410
        : ['CONFLICT', 'INVALID_TRANSITION', 'RECOMMENDATION_UNAVAILABLE'].includes(code) ? 409
          : 400
    return NextResponse.json({ ok: false, error: { code, message: 'Daily learning progress could not be updated.' } }, { status })
  }
  return NextResponse.json({ ok: true, ...result })
}