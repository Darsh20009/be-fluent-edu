import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase6DatabaseGuard, sessionCreateSchema } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'
import { findIneligibleSessionStudents } from '@/lib/session-eligibility'

export async function GET(request: NextRequest) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const status = request.nextUrl.searchParams.get('status') || undefined
  const items = await prisma.session.findMany({
    where: { status },
    include: {
      TeacherProfile: { include: { User: true } },
      group: { include: { level: true, stage: true } },
      groupSchedule: true,
      participants: { include: { user: true } },
      attendances: true,
      qmeetMeeting: true,
    },
    orderBy: { startTime: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = sessionCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data

  const [teacher, group, schedule] = await Promise.all([
    prisma.teacherProfile.findUnique({ where: { id: body.teacherProfileId }, include: { User: true } }),
    body.groupId ? prisma.learningGroup.findUnique({ where: { id: body.groupId } }) : null,
    body.groupScheduleId ? prisma.groupSchedule.findUnique({ where: { id: body.groupScheduleId } }) : null,
  ])
  if (!teacher || !teacher.User.isActive) {
    return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_AVAILABLE', message: 'Teacher is not available' } }, { status: 409 })
  }
  if (body.groupId && (!group || !['ACTIVE', 'DRAFT'].includes(group.status))) {
    return NextResponse.json({ ok: false, error: { code: 'GROUP_NOT_AVAILABLE', message: 'Group is not available' } }, { status: 409 })
  }
  if (schedule && (schedule.groupId !== body.groupId || schedule.status !== 'ACTIVE')) {
    return NextResponse.json({ ok: false, error: { code: 'SCHEDULE_MISMATCH', message: 'Schedule does not belong to the selected group' } }, { status: 409 })
  }
  const participantIds = [...new Set(body.participantIds)]
  if (participantIds.length > 0) {
    const ineligible = body.groupId ? await findIneligibleSessionStudents(body.groupId, participantIds) : participantIds
    if (ineligible.length > 0) {
      return NextResponse.json({ ok: false, error: { code: 'PARTICIPANT_NOT_ELIGIBLE', message: 'All students must be active members of the selected group' } }, { status: 409 })
    }
  }

  const created = await prisma.session.create({
    data: {
      title: body.title,
      teacherId: body.teacherProfileId,
      groupId: body.groupId,
      groupScheduleId: body.groupScheduleId,
      levelId: body.levelId ?? group?.levelId,
      stageId: body.stageId ?? group?.stageId,
      startTime: body.startTime,
      endTime: body.endTime,
      status: body.status,
      roomId: randomUUID(),
      participants: { create: participantIds.map((userId) => ({ userId })) },
    },
    include: { participants: true },
  })
  await recordAuditEvent({ action: 'SESSION_CHANGE', userId: access.userId, details: { sessionId: created.id, action: 'CREATED', status: created.status } }).catch(() => undefined)
  return NextResponse.json(created, { status: 201 })
}