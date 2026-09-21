import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase6DatabaseGuard } from '@/lib/phase6'

export async function GET() {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('student.viewSessions')
  if (isNextResponse(access)) return access
  const items = await prisma.sessionParticipant.findMany({
    where: { userId: access.userId, status: { notIn: ['CANCELLED'] } },
    include: {
      session: {
        include: {
          TeacherProfile: { include: { User: { select: { id: true, name: true } } } },
          group: true,
          qmeetMeeting: { select: { status: true } },
          attendances: { where: { userId: access.userId } },
        },
      },
    },
    orderBy: { session: { startTime: 'asc' } },
  })
  return NextResponse.json({
    items: items.map((participant) => ({
      ...participant.session,
      participantStatus: participant.status,
      attendance: participant.session.attendances[0] ?? null,
    })),
  })
}