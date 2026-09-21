import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { attendanceMutationSchema, calculateAttendanceDuration, phase6DatabaseGuard } from '@/lib/phase6'
import { validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const items = await prisma.attendance.findMany({ where: { sessionId: id }, include: { user: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase6DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) return access
  const parsed = attendanceMutationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const participant = await prisma.sessionParticipant.findUnique({ where: { sessionId_userId: { sessionId: id, userId: parsed.data.userId } } })
  if (!participant || participant.status === 'CANCELLED') {
    return NextResponse.json({ ok: false, error: { code: 'PARTICIPANT_NOT_ELIGIBLE', message: 'Student is not an eligible session participant' } }, { status: 409 })
  }
  const durationSeconds = calculateAttendanceDuration(parsed.data.joinedAt, parsed.data.leftAt)
  const item = await prisma.attendance.upsert({
    where: { sessionId_userId: { sessionId: id, userId: parsed.data.userId } },
    create: { sessionId: id, ...parsed.data, durationSeconds },
    update: { ...parsed.data, durationSeconds },
  })
  await recordAuditEvent({ action: 'ATTENDANCE_CHANGE', userId: access.userId, details: { sessionId: id, studentId: parsed.data.userId, status: item.status } }).catch(() => undefined)
  return NextResponse.json(item)
}