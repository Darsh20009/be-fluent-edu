import { NextResponse } from 'next/server'
import { isNextResponse, requireTeacher, canSession } from '@/lib/auth-helpers'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { getTeacherStudentIntelligence } from '@/lib/phase9/staff-service'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.viewStudentIntelligence')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const { id } = await params
  const result = await getTeacherStudentIntelligence(access, id)
  if (!result) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found or not assigned to this teacher' } }, { status: 404 })
  return NextResponse.json(result)
}