import { NextResponse } from 'next/server'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { phase9DatabaseGuard, startTodayLearning } from '@/lib/phase9/student-service'

export async function POST() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const result = await startTodayLearning(access.userId)
  if (result.error) return NextResponse.json({ ok: true, created: false, session: null, plan: result.plan, code: result.error })
  return NextResponse.json({ ok: true, ...result }, { status: result.created ? 201 : 200 })
}