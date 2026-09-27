import { NextResponse } from 'next/server'
import { getStudentRecommendations, phase9DatabaseGuard } from '@/lib/phase9/student-service'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'

export async function GET() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  return NextResponse.json({ ok: true, items: await getStudentRecommendations(access.userId) })
}