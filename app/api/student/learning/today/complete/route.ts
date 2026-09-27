import { NextResponse } from 'next/server'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { completeTodayLearning, phase9DatabaseGuard } from '@/lib/phase9/student-service'

export async function POST() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const result = await completeTodayLearning(access.userId)
  if ('error' in result) {
    const status = result.error === 'NOT_FOUND' ? 404 : result.error === 'CONFLICT' ? 409 : 400
    return NextResponse.json({ ok: false, error: { code: result.error, message: 'Daily learning session is not ready to complete.' } }, { status })
  }
  return NextResponse.json({ ok: true, ...result })
}