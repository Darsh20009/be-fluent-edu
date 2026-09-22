import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase8SpeakingDatabaseGuard, speakingRoomAudit } from '@/lib/phase8-speaking'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; reportId: string }> }) {
  const blocked = phase8SpeakingDatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.moderateSpeakingRooms'); if (isNextResponse(access)) return access
  const { id, reportId } = await params
  const body = await request.json().catch(() => ({})) as { status?: string; resolutionNote?: string }
  if (!['RESOLVED', 'DISMISSED'].includes(String(body.status))) return NextResponse.json({ ok: false, error: { code: 'INVALID_STATUS', message: 'Unsupported report status' } }, { status: 400 })
  const report = await prisma.speakingRoomReport.findFirst({ where: { id: reportId, roomId: id } })
  if (!report) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Report not found' } }, { status: 404 })
  const updated = await prisma.speakingRoomReport.update({ where: { id: report.id }, data: { status: body.status, resolutionNote: body.resolutionNote, resolvedById: access.userId, resolvedAt: new Date() } })
  await speakingRoomAudit(access.userId, 'REPORT_RESOLVED', id, { reportId, status: body.status })
  return NextResponse.json(updated)
}