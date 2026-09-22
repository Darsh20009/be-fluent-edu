import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { validationError } from '@/lib/phase5'
import { phase8SpeakingDatabaseGuard, speakingReportSchema, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.accessSpeakingRooms'); if (isNextResponse(access)) return access
  const { id } = await params
  const member = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: access.userId } } })
  if (!member || member.status !== 'ACTIVE') return NextResponse.json({ ok: false, error: { code: 'MEMBERSHIP_REQUIRED', message: 'Join the room before reporting.' } }, { status: 403 })
  const parsed = speakingReportSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  if (!parsed.data.targetUserId && !parsed.data.messageId) return NextResponse.json({ ok: false, error: { code: 'REPORT_TARGET_REQUIRED', message: 'A member or message is required.' } }, { status: 400 })
  if (parsed.data.targetUserId) {
    const target = await prisma.speakingRoomMember.findUnique({ where: { roomId_userId: { roomId: id, userId: parsed.data.targetUserId } } })
    if (!target) return NextResponse.json({ ok: false, error: { code: 'TARGET_NOT_IN_ROOM', message: 'Target member is not in this room.' } }, { status: 400 })
  }
  if (parsed.data.messageId) {
    const message = await prisma.speakingRoomMessage.findFirst({ where: { id: parsed.data.messageId, roomId: id } })
    if (!message) return NextResponse.json({ ok: false, error: { code: 'MESSAGE_NOT_IN_ROOM', message: 'Target message is not in this room.' } }, { status: 400 })
  }
  const report = await prisma.speakingRoomReport.create({ data: { roomId: id, reporterId: access.userId, targetUserId: parsed.data.targetUserId, messageId: parsed.data.messageId, reason: parsed.data.reason } })
  await speakingRoomAudit(access.userId, 'REPORT_CREATED', id, { reportId: report.id })
  return NextResponse.json(report, { status: 201 })
}