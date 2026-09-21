import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('student.viewFeedback'); if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.sessionFeedback.findFirst({
    where: { id, studentId: access.userId, status: 'PUBLISHED', session: { status: { in: ['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'] }, participants: { some: { userId: access.userId, status: { not: 'CANCELLED' } } } } },
    select: {
      id: true, sessionId: true, studentId: true, summary: true, status: true, publishedAt: true,
      expressions: true, mistakes: true, pronunciation: true, ebi: true,
      session: { select: { id: true, title: true, startTime: true, endTime: true, TeacherProfile: { select: { User: { select: { id: true, name: true } } } } } },
    },
  })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Feedback not found' } }, { status: 404 })
  return NextResponse.json(item)
}