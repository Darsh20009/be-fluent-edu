import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase6DatabaseGuard } from '@/lib/phase6'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('student.viewSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const participant = await prisma.sessionParticipant.findUnique({
    where: { sessionId_userId: { sessionId: id, userId: access.userId } },
    include: {
      session: {
        include: {
          TeacherProfile: { include: { User: { select: { name: true } } } },
          group: true,
          groupSchedule: true,
          qmeetMeeting: { select: { status: true } },
          attendances: { where: { userId: access.userId } },
        },
      },
    },
  })
  if (!participant || participant.status === 'CANCELLED') {
    return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Authorized session not found' } }, { status: 404 })
  }
  return NextResponse.json({ ...participant.session, participantStatus: participant.status, attendance: participant.session.attendances[0] ?? null })
}