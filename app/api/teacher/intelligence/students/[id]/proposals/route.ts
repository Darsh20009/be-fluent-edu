import { NextResponse } from 'next/server'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import {
  generateTeacherStudentProposals,
  getTeacherStudentProposalDrafts,
} from '@/lib/phase9/staff-service'
import { ProposalGenerationError } from '@/lib/phase9/ai-proposals'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageIntelligenceSuggestions')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const { id } = await params
  const result = await getTeacherStudentProposalDrafts(access, id)
  if (result.kind === 'FORBIDDEN') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found or not assigned to this teacher' } }, { status: 404 })
  }
  return NextResponse.json({ ok: true, items: result.items })
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageIntelligenceSuggestions')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const { id } = await params
  try {
    const result = await generateTeacherStudentProposals(access, id)
    if (result.kind === 'FORBIDDEN') {
      return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Student is not assigned to this teacher' } }, { status: 403 })
    }
    if (result.kind === 'NOT_FOUND') {
      return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found or not assigned to this teacher' } }, { status: 404 })
    }
    if (result.kind === 'CONFLICT') {
      return NextResponse.json({ ok: false, error: { code: 'PROPOSAL_CONTEXT_CHANGED', message: 'The learner level or a selected resource changed. Generate proposals again.' } }, { status: 409 })
    }
    return NextResponse.json({
      ok: true,
      mode: 'PROVIDER',
      items: result.suggestions,
      persisted: true,
    })
  } catch (error) {
    if (error instanceof ProposalGenerationError) {
      if (error.code === 'PROVIDER_UNAVAILABLE') {
        return NextResponse.json({
          ok: false,
          error: { code: 'AI_PROVIDER_UNAVAILABLE', message: 'AI proposal generation is unavailable because the provider is not configured.' },
        }, { status: 503 })
      }
      if (error.code === 'INVALID_PROVIDER_OUTPUT') {
        return NextResponse.json({
          ok: false,
          error: { code: 'AI_INVALID_RESPONSE', message: 'The AI provider returned a response that could not be safely used.' },
        }, { status: 502 })
      }
      return NextResponse.json({
        ok: false,
        error: { code: 'AI_PROVIDER_ERROR', message: 'The AI provider could not generate proposals. Please retry.' },
      }, { status: 502 })
    }
    return NextResponse.json({
      ok: false,
      error: { code: 'AI_GENERATION_FAILED', message: 'AI proposals could not be generated. Please retry.' },
    }, { status: 500 })
  }
}