import { NextResponse } from 'next/server'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { phase9DatabaseGuard, transitionStudentRecommendation } from '@/lib/phase9/student-service'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const { id } = await params
  const result = await transitionStudentRecommendation(access.userId, id, 'ACCEPTED')
  if (result.error) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'CONFLICT' ? 409 : 410
    return NextResponse.json({ ok: false, error: { code: result.error, message: 'Recommendation could not be accepted.' } }, { status })
  }
  return NextResponse.json({ ok: true, item: result.item })
}