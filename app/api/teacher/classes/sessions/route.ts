import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canSession, isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { phase6DatabaseGuard } from '@/lib/phase6'

export async function GET() {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageAssignedSessions')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const items = await prisma.session.findMany({
    where: { teacherId: access.teacherProfileId },
    include: { group: true, groupSchedule: true, participants: { include: { user: true } }, attendances: true, qmeetMeeting: true },
    orderBy: { startTime: 'desc' },
  })
  return NextResponse.json({ items })
}