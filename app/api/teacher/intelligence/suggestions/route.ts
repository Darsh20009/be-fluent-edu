import { NextRequest, NextResponse } from 'next/server'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { createTeacherSuggestion } from '@/lib/phase9/staff-service'

export async function POST(request: NextRequest) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageIntelligenceSuggestions')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_REQUEST', message: 'A suggestion draft is required' } }, { status: 400 })
  }
  const result = await createTeacherSuggestion(access, body)
  if (result.kind === 'FORBIDDEN') return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Student is not assigned to this teacher' } }, { status: 403 })
  if (result.kind !== 'CREATED') return NextResponse.json({ ok: false, error: { code: result.kind === 'INVALID_DRAFT' ? 'INVALID_DRAFT' : 'VALIDATION_ERROR', message: 'Suggestion draft is invalid' } }, { status: 400 })
  return NextResponse.json(result.item, { status: 201 })
}