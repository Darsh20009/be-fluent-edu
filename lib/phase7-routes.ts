import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recordAuditEvent } from '@/lib/audit'
import type { Prisma } from '@prisma/client'
import type { z } from 'zod'
import { feedbackUpsertSchema } from '@/lib/phase7'

type FeedbackBody = z.infer<typeof feedbackUpsertSchema>

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN', message } }, { status: 403 })
}

export async function sessionForFeedback(sessionId: string, studentId: string, teacherId?: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { participants: true, TeacherProfile: { include: { User: true } } },
  })
  if (!session || (teacherId && session.teacherId !== teacherId) || !['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'].includes(session.status)) return null
  if (!session.participants.some((p) => p.userId === studentId && p.status !== 'CANCELLED')) return null
  return session
}

export async function replaceFeedbackChildren(tx: Prisma.TransactionClient, feedbackId: string, body: FeedbackBody) {
  await Promise.all([
    tx.feedbackExpression.deleteMany({ where: { feedbackId } }),
    tx.feedbackMistake.deleteMany({ where: { feedbackId } }),
    tx.feedbackPronunciation.deleteMany({ where: { feedbackId } }),
    tx.feedbackEBI.deleteMany({ where: { feedbackId } }),
  ])
  if (body.expressions.length) await tx.feedbackExpression.createMany({ data: body.expressions.map((item) => ({ ...item, feedbackId })) })
  if (body.mistakes.length) await tx.feedbackMistake.createMany({ data: body.mistakes.map((item) => ({ ...item, feedbackId })) })
  if (body.pronunciation.length) await tx.feedbackPronunciation.createMany({ data: body.pronunciation.map((item) => ({ ...item, feedbackId })) })
  if (body.ebi.length) await tx.feedbackEBI.createMany({ data: body.ebi.map((item) => ({ ...item, feedbackId })) })
}

export async function createFeedbackRevision(
  tx: Prisma.TransactionClient,
  feedback: {
    id: string
    publicationVersion: number
    summary: string | null
    teacherNotes: string | null
    expressions: unknown[]
    mistakes: unknown[]
    pronunciation: unknown[]
    ebi: unknown[]
  },
  changedById: string,
  reason: string,
) {
  await tx.feedbackRevision.create({
    data: {
      feedbackId: feedback.id,
      version: feedback.publicationVersion,
      changedById,
      reason,
      snapshotJson: JSON.stringify({
        summary: feedback.summary,
        teacherNotes: feedback.teacherNotes,
        expressions: feedback.expressions,
        mistakes: feedback.mistakes,
        pronunciation: feedback.pronunciation,
        ebi: feedback.ebi,
      }),
    },
  })
}

export async function auditFeedback(userId: string, feedbackId: string, action: string) {
  await recordAuditEvent({ action: 'FEEDBACK_CHANGE', userId, details: { feedbackId, action } }).catch(() => undefined)
}