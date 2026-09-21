import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { feedbackUpsertSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { auditFeedback, replaceFeedbackChildren, sessionForFeedback } from '@/lib/phase7-routes'

export async function GET(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedback'); if (isNextResponse(access)) return access
  const status = request.nextUrl.searchParams.get('status') || undefined
  const items = await prisma.sessionFeedback.findMany({ where: status ? { status } : undefined, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedback'); if (isNextResponse(access)) return access
  const parsed = feedbackUpsertSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  const session = await sessionForFeedback(parsed.data.sessionId, parsed.data.studentId)
  if (!session) return NextResponse.json({ ok: false, error: { code: 'SESSION_NOT_ELIGIBLE', message: 'Ended session and participant required' } }, { status: 409 })
  const existing = await prisma.sessionFeedback.findUnique({ where: { sessionId_studentId: { sessionId: parsed.data.sessionId, studentId: parsed.data.studentId } } })
  if (existing) return NextResponse.json({ ok: false, error: { code: 'ALREADY_EXISTS', message: 'Feedback already exists for this student and session' } }, { status: 409 })
  const item = await prisma.$transaction(async (tx) => {
    const feedback = await tx.sessionFeedback.create({ data: { sessionId: parsed.data.sessionId, studentId: parsed.data.studentId, teacherId: session.TeacherProfile.User.id, summary: parsed.data.summary, teacherNotes: parsed.data.teacherNotes } })
    await replaceFeedbackChildren(tx, feedback.id, parsed.data)
    return tx.sessionFeedback.findUniqueOrThrow({ where: { id: feedback.id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true } })
  })
  await auditFeedback(access.userId, item.id, 'ADMIN_CREATED')
  return NextResponse.json(item, { status: 201 })
}