import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { groupScheduleSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = groupScheduleSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const group = await prisma.learningGroup.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Group not found' } }, { status: 404 })
  const teacherProfileId = parsed.data.teacherProfileId ?? group.teacherProfileId
  if (teacherProfileId) {
    const endMinute = parsed.data.startMinute + parsed.data.durationMinutes
    const conflicting = await prisma.groupSchedule.findFirst({
      where: {
        teacherProfileId,
        dayOfWeek: parsed.data.dayOfWeek,
        status: 'ACTIVE',
        startMinute: { lt: endMinute },
      },
    })
    if (conflicting && conflicting.startMinute + conflicting.durationMinutes > parsed.data.startMinute) {
      return NextResponse.json({ ok: false, error: { code: 'TEACHER_SCHEDULE_CONFLICT', message: 'Teacher already has an overlapping group schedule' } }, { status: 409 })
    }
  }
  const schedule = await prisma.groupSchedule.create({
    data: { ...parsed.data, groupId: id, teacherProfileId },
  })
  await recordAuditEvent({ action: 'GROUP_SCHEDULE_CHANGE', userId: access.userId, details: { groupId: id, scheduleId: schedule.id, action: 'CREATED' } }).catch(() => undefined)
  return NextResponse.json(schedule, { status: 201 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const scheduleId = request.nextUrl.searchParams.get('scheduleId')
  if (!scheduleId) return NextResponse.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'scheduleId is required' } }, { status: 400 })
  const { id } = await params
  const schedule = await prisma.groupSchedule.findFirst({ where: { id: scheduleId, groupId: id } })
  if (!schedule) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Schedule not found' } }, { status: 404 })
  const updated = await prisma.groupSchedule.update({ where: { id: scheduleId }, data: { status: 'INACTIVE' } })
  await recordAuditEvent({ action: 'GROUP_SCHEDULE_CHANGE', userId: access.userId, details: { groupId: id, scheduleId, action: 'DEACTIVATED' } }).catch(() => undefined)
  return NextResponse.json(updated)
}