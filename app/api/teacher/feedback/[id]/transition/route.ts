import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission, requireTeacher } from '@/lib/auth-helpers'
import { phase7DatabaseGuard, feedbackTransitionSchema, canTransitionFeedback } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { auditFeedback } from '@/lib/phase7-routes'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  const permission = await requirePermission('teacher.publishFeedback'); if (isNextResponse(permission)) return permission
  const parsed = feedbackTransitionSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const existing = await prisma.sessionFeedback.findUnique({
    where: { id },
    include: { expressions: true, mistakes: true, pronunciation: true, ebi: true, session: true },
  })
  if (!existing || existing.teacherId !== access.userId) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } }, { status: 404 })
  if (!canTransitionFeedback(existing.status, parsed.data.status)) return NextResponse.json({ ok: false, error: { code: 'INVALID_TRANSITION', message: 'Invalid feedback lifecycle transition' } }, { status: 409 })
  if (parsed.data.status === 'PUBLISHED') {
    if (!['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(existing.session.status)) {
      return NextResponse.json({ ok: false, error: { code: 'SESSION_NOT_ELIGIBLE', message: 'Feedback can only be published for an ended session' } }, { status: 409 })
    }
    const hasContent = Boolean(existing.summary || existing.expressions.length || existing.mistakes.length || existing.pronunciation.length || existing.ebi.length)
    if (!hasContent) return NextResponse.json({ ok: false, error: { code: 'FEEDBACK_EMPTY', message: 'Feedback must contain educational content before publication' } }, { status: 409 })
  }
  const item = await prisma.$transaction(async (tx) => {
    const updated = await tx.sessionFeedback.update({ where: { id }, data: { status: parsed.data.status, publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : undefined, publishedById: parsed.data.status === 'PUBLISHED' ? access.userId : undefined, publicationVersion: parsed.data.status === 'PUBLISHED' ? { increment: 1 } : undefined } })
    if (parsed.data.status === 'PUBLISHED') {
      await queuePhase7Notifications({ event: 'feedback.published', entityId: id, recipientUserId: existing.studentId, title: 'Class feedback published', body: existing.summary || 'Your teacher published feedback for your class.' }, tx)
    }
    return updated
  })
  await auditFeedback(access.userId, id, `STATUS_${parsed.data.status}`)
  return NextResponse.json(item)
}