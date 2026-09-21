import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { canSession } from '@/lib/auth-helpers'
import { phase5DatabaseGuard } from '@/lib/phase5'

export async function GET() {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.viewAssignedGroups')) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  }
  const items = await prisma.learningGroup.findMany({
    where: { teacherProfileId: access.teacherProfileId },
    include: { level: true, stage: true, schedules: true, members: { where: { status: 'ACTIVE' }, include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}