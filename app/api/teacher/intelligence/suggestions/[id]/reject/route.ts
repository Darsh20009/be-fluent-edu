import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { rejectTeacherSuggestion } from '@/lib/phase9/staff-service'
import { validationError } from '@/lib/phase5'

const rejectSchema = z.object({ rejected: z.literal(true) }).strict()

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageIntelligenceSuggestions')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const parsed = rejectSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const result = await rejectTeacherSuggestion(access, id)
  if (result.kind === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Student is not assigned to this teacher' } }, { status: 403 })
  }
  if (result.kind === 'CONFLICT') {
    return NextResponse.json({ ok: false, error: { code: 'ALREADY_PROCESSED', message: 'Suggestion is no longer pending review' } }, { status: 409 })
  }
  if (result.kind === 'NOT_FOUND') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'AI proposal not found' } }, { status: 404 })
  }
  return NextResponse.json(result)
}