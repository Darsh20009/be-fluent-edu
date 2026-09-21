import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { phase5DatabaseGuard } from '@/lib/phase5'

export async function GET() {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('student.viewCommercial')
  if (isNextResponse(access)) return access
  const [subscriptions, enrollments] = await Promise.all([
    prisma.subscription.findMany({
      where: { studentId: access.userId },
      include: { Package: true, AssignedTeacher: { include: { User: true } }, group: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment.findMany({
      where: { studentId: access.userId },
      include: { package: true, group: { include: { schedules: true, teacher: { include: { User: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])
  return NextResponse.json({ subscriptions, enrollments })
}