import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase6DatabaseGuard, sessionUpdateSchema } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'
import { findIneligibleSessionStudents } from '@/lib/session-eligibility'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.session.findUnique({
    where: { id },
    include: {
      TeacherProfile: { include: { User: true } },
      group: true,
      groupSchedule: true,
      participants: { include: { user: true } },
      attendances: { include: { user: true } },
      qmeetMeeting: true,
    },
  })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = sessionUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.session.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Session not found' } }, { status: 404 })
  if (['LIVE', 'ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(existing.status)) {
    return NextResponse.json({ ok: false, error: { code: 'SESSION_LOCKED', message: 'Session can no longer be rescheduled' } }, { status: 409 })
  }
  const startTime = parsed.data.startTime ?? existing.startTime
  const endTime = parsed.data.endTime ?? existing.endTime
  if (startTime >= endTime) return NextResponse.json({ ok: false, error: { code: 'INVALID_TIME_RANGE', message: 'Start time must be before end time' } }, { status: 400 })
  const teacherId = parsed.data.teacherProfileId ?? existing.teacherId
  const groupId = parsed.data.groupId === undefined ? existing.groupId : parsed.data.groupId
  const scheduleId = parsed.data.groupScheduleId === undefined ? existing.groupScheduleId : parsed.data.groupScheduleId
  const [teacher, group, schedule, participants] = await Promise.all([
    prisma.teacherProfile.findUnique({ where: { id: teacherId }, include: { User: true } }),
    groupId ? prisma.learningGroup.findUnique({ where: { id: groupId } }) : null,
    scheduleId ? prisma.groupSchedule.findUnique({ where: { id: scheduleId } }) : null,
    prisma.sessionParticipant.findMany({ where: { sessionId: id, status: { notIn: ['CANCELLED', 'LEFT'] } }, select: { userId: true } }),
  ])
  if (!teacher || !teacher.User.isActive) return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_AVAILABLE', message: 'Teacher is not available' } }, { status: 409 })
  if (groupId && (!group || !['ACTIVE', 'DRAFT'].includes(group.status))) return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_AVAILABLE', message: 'Group is not available' } }, { status: 409 })
  if (schedule && (schedule.groupId !== groupId || (schedule.teacherProfileId && schedule.teacherProfileId !== teacherId) || schedule.status !== 'ACTIVE')) {
    return NextResponse.json({ ok: false, error: { code: 'SCHEDULE_MISMATCH', message: 'Schedule is incompatible with the selected group and teacher' } }, { status: 409 })
  }
  if (participants.length > 0) {
    const ineligible = groupId ? await findIneligibleSessionStudents(groupId, participants.map((participant) => participant.userId)) : participants.map((participant) => participant.userId)
    if (ineligible.length > 0) return NextResponse.json({ ok: false, error: { code: 'PARTICIPANT_NOT_ELIGIBLE', message: 'Reassignment would make existing participants ineligible' } }, { status: 409 })
  }
  const updated = await prisma.session.updateMany({ where: { id, status: existing.status }, data: parsed.data })
  if (updated.count !== 1) return NextResponse.json({ ok: false, error: { code: 'SESSION_CONFLICT', message: 'Session changed while the update was being applied' } }, { status: 409 })
  const item = await prisma.session.findUniqueOrThrow({ where: { id } })
  await recordAuditEvent({ action: 'SESSION_CHANGE', userId: access.userId, details: { sessionId: id, action: 'UPDATED', fields: Object.keys(parsed.data) } }).catch(() => undefined)
  return NextResponse.json(item)
}