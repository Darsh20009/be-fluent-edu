import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission, requireTeacher } from '@/lib/auth-helpers'
import { phase7DatabaseGuard, feedbackUpsertSchema } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { auditFeedback, createFeedbackRevision, replaceFeedbackChildren, sessionForFeedback } from '@/lib/phase7-routes'

export async function GET() {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  const checked = await requirePermission('teacher.editFeedback'); if (isNextResponse(checked)) return checked
  const items = await prisma.sessionFeedback.findMany({ where: { teacherId: access.userId }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireTeacher(); if (isNextResponse(access)) return access
  const permission = await requirePermission('teacher.editFeedback'); if (isNextResponse(permission)) return permission
  const parsed = feedbackUpsertSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data
  const session = await sessionForFeedback(body.sessionId, body.studentId, access.teacherProfileId)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'SESSION_NOT_ELIGIBLE', message: 'Completed assigned session and participant required' } }, { status: 409 })
  const existing = await prisma.sessionFeedback.findUnique({
    where: { sessionId_studentId: { sessionId: body.sessionId, studentId: body.studentId } },
    include: { expressions: true, mistakes: true, pronunciation: true, ebi: true },
  })
  if (existing?.status === 'PUBLISHED' && !existing.editAfterPublishAllowed) return NextResponse.json({ ok: false, error: { code: 'FEEDBACK_IMMUTABLE', message: 'Published feedback cannot be edited' } }, { status: 409 })
  const item = await prisma.$transaction(async (tx) => {
    if (existing?.status === 'PUBLISHED') {
      await createFeedbackRevision(tx, existing, access.userId, 'TEACHER_EDIT_AFTER_PUBLICATION')
    }
    const feedback = existing
      ? await tx.sessionFeedback.update({ where: { id: existing.id }, data: { summary: body.summary, teacherNotes: body.teacherNotes, publicationVersion: existing.status === 'PUBLISHED' ? { increment: 1 } : undefined } })
      : await tx.sessionFeedback.create({ data: { sessionId: body.sessionId, studentId: body.studentId, teacherId: access.userId, summary: body.summary, teacherNotes: body.teacherNotes } })
    await replaceFeedbackChildren(tx, feedback.id, body)
    return tx.sessionFeedback.findUnique({ where: { id: feedback.id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true } })
  })
  await auditFeedback(access.userId, item!.id, existing?.status === 'PUBLISHED' ? 'TEACHER_EDITED_AFTER_PUBLICATION' : existing ? 'UPDATED' : 'CREATED')
  return NextResponse.json(item, { status: existing ? 200 : 201 })
}