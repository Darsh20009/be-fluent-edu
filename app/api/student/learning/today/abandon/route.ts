import { NextResponse } from 'next/server'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { abandonTodayLearning, phase9DatabaseGuard } from '@/lib/phase9/student-service'

export async function POST() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access

  const result = await abandonTodayLearning(access.userId)
  if ('error' in result) {
    const status = result.error === 'NOT_FOUND' ? 404 : 409
    return NextResponse.json({
      ok: false,
      error: { code: result.error, message: 'Daily learning session could not be ended.' },
    }, { status })
  }
  return NextResponse.json({ ok: true, ...result })
}