import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission, requireStudent } from '@/lib/auth-helpers'
import { phase7DatabaseGuard } from '@/lib/phase7'

export async function GET(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requireStudent(); if (isNextResponse(access)) return access
  const permission = await requirePermission('student.viewFeedback'); if (isNextResponse(permission)) return permission
  const sessionId = request.nextUrl.searchParams.get('sessionId') || undefined
  const items = await prisma.sessionFeedback.findMany({
    where: { studentId: access.userId, status: 'PUBLISHED', session: { status: { in: ['ENDED', 'FEEDBACK_PENDING', 'COMPLETED'] }, participants: { some: { userId: access.userId, status: { not: 'CANCELLED' } } } }, ...(sessionId ? { sessionId } : {}) },
    select: {
      id: true, sessionId: true, studentId: true, summary: true, status: true, publishedAt: true,
      expressions: true, mistakes: true, pronunciation: true, ebi: true,
      session: { select: { id: true, title: true, startTime: true, endTime: true, TeacherProfile: { select: { User: { select: { id: true, name: true } } } } } },
    },
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json({ items })
}