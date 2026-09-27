import { NextResponse } from 'next/server'
import { getStudentLearningProfile, phase9DatabaseGuard } from '@/lib/phase9/student-service'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'

export async function GET() {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const profile = await getStudentLearningProfile(access.userId)
  return NextResponse.json({ ok: true, profile })
}