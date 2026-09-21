import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { canTransitionFeedback, feedbackTransitionSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { auditFeedback } from '@/lib/phase7-routes'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedback'); if (isNextResponse(access)) return access
  const parsed = feedbackTransitionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.sessionFeedback.findUnique({ where: { id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true, session: true } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } }, { status: 404 })
  if (!canTransitionFeedback(existing.status, parsed.data.status)) return NextResponse.json({ ok: false, error: { code: 'INVALID_TRANSITION', message: 'Invalid feedback lifecycle transition' } }, { status: 409 })
  if (parsed.data.status === 'PUBLISHED') {
    const hasContent = Boolean(existing.summary || existing.expressions.length || existing.mistakes.length || existing.pronunciation.length || existing.ebi.length)
    if (!['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(existing.session.status) || !hasContent) {
      return NextResponse.json({ ok: false, error: { code: 'FEEDBACK_NOT_PUBLISHABLE', message: 'Ended session and educational content are required' } }, { status: 409 })
    }
  }
  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.sessionFeedback.update({ where: { id }, data: { status: parsed.data.status, publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : undefined, publishedById: parsed.data.status === 'PUBLISHED' ? access.userId : undefined, publicationVersion: parsed.data.status === 'PUBLISHED' ? { increment: 1 } : undefined } })
    if (parsed.data.status === 'PUBLISHED') await queuePhase7Notifications({ event: 'feedback.published', entityId: id, recipientUserId: existing.studentId, title: 'Class feedback published', body: existing.summary || 'Your class feedback is ready.' }, tx)
    return updated
  })
  await auditFeedback(access.userId, id, `ADMIN_STATUS_${parsed.data.status}`)
  return NextResponse.json(item)
}