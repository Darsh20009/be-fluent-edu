import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canSession, isNextResponse, requireTeacher } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { attendanceMutationSchema, calculateAttendanceDuration, phase6DatabaseGuard } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'
import { persistAttendanceSignal } from '@/lib/phase9/pipeline'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requireTeacher()
  if (isNextResponse(access)) return access
  if (!canSession(access, 'teacher.manageAttendance')) return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 })
  const parsed = attendanceMutationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const session = await prisma.session.findUnique({ where: { id } })
  if (!session || session.teacherId !== access.teacherProfileId) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Assigned session not found' } }, { status: 404 })
  const participant = await prisma.sessionParticipant.findUnique({ where: { sessionId_userId: { sessionId: id, userId: parsed.data.userId } } })
  if (!participant || participant.status === 'CANCELLED') return NextResponse.json({ ok: false, error: { code: 'PARTICIPANT_NOT_ELIGIBLE', message: 'Student is not eligible' } }, { status: 409 })
  const durationSeconds = calculateAttendanceDuration(parsed.data.joinedAt, parsed.data.leftAt)
  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.attendance.upsert({
      where: { sessionId_userId: { sessionId: id, userId: parsed.data.userId } },
      create: { sessionId: id, ...parsed.data, durationSeconds },
      update: { ...parsed.data, durationSeconds },
    })
    await persistAttendanceSignal(tx, {
      attendanceId: updated.id,
      studentId: updated.userId,
      sessionId: updated.sessionId,
      status: updated.status,
      occurredAt: updated.updatedAt,
    })
    return updated
  })
  await recordAuditEvent({ action: 'ATTENDANCE_CHANGE', userId: access.userId, details: { sessionId: id, studentId: parsed.data.userId, status: item.status } }).catch(() => undefined)
  return NextResponse.json(item)
}