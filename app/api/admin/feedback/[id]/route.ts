import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { feedbackUpsertSchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
import { auditFeedback, createFeedbackRevision, replaceFeedbackChildren } from '@/lib/phase7-routes'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedback'); if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.sessionFeedback.findUnique({ where: { id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true, session: true } })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } }, { status: 404 })
  return NextResponse.json(item)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedback'); if (isNextResponse(access)) return access
  const { id } = await params
  const existing = await prisma.sessionFeedback.findUnique({ where: { id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true } })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } }, { status: 404 })
  const parsed = feedbackUpsertSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  if (parsed.data.sessionId !== existing.sessionId || parsed.data.studentId !== existing.studentId) {
    return NextResponse.json({ ok: false, error: { code: 'RELATION_IMMUTABLE', message: 'Session and student cannot be changed' } }, { status: 409 })
  }
  const item = await prisma.$transaction(async (tx) => {
    if (existing.status === 'PUBLISHED') await createFeedbackRevision(tx, existing, access.userId, 'ADMIN_EDIT_AFTER_PUBLICATION')
    await tx.sessionFeedback.update({ where: { id }, data: { summary: parsed.data.summary, teacherNotes: parsed.data.teacherNotes, publicationVersion: existing.status === 'PUBLISHED' ? { increment: 1 } : undefined } })
    await replaceFeedbackChildren(tx, id, parsed.data)
    return tx.sessionFeedback.findUniqueOrThrow({ where: { id }, include: { expressions: true, mistakes: true, pronunciation: true, ebi: true } })
  })
  await auditFeedback(access.userId, id, existing.status === 'PUBLISHED' ? 'ADMIN_EDITED_AFTER_PUBLICATION' : 'ADMIN_UPDATED')
  return NextResponse.json(item)
}