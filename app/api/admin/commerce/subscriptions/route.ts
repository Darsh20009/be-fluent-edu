import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard, subscriptionCreateSchema, validationError } from '@/lib/phase5'

export async function GET(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSubscriptions')
  if (isNextResponse(access)) return access
  const status = request.nextUrl.searchParams.get('status') as 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | null
  const items = await prisma.subscription.findMany({
    where: status ? { status } : undefined,
    include: {
      User: { select: { id: true, name: true, email: true, status: true } },
      Package: true,
      AssignedTeacher: { include: { User: true } },
      group: true,
      Enrollment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageSubscriptions')
  if (isNextResponse(access)) return access
  const parsed = subscriptionCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data
  const [student, pkg] = await Promise.all([
    prisma.user.findUnique({ where: { id: body.studentId } }),
    prisma.package.findUnique({ where: { id: body.packageId } }),
  ])
  if (!student || student.role !== 'STUDENT') return NextResponse.json({ ok: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  if (!pkg || !pkg.isActive) return NextResponse.json({ ok: false, error: { code: 'PACKAGE_NOT_USABLE', message: 'Package is not active' } }, { status: 409 })
  if (pkg.subscriptionType && pkg.subscriptionType !== body.subscriptionType) {
    return NextResponse.json({ ok: false, error: { code: 'TYPE_MISMATCH', message: 'Package subscription type is incompatible' } }, { status: 409 })
  }
  const existing = await prisma.subscription.findFirst({ where: { studentId: body.studentId, status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] } } })
  if (existing) return NextResponse.json({ ok: false, error: { code: 'SUBSCRIPTION_CONFLICT', message: 'Student already has an open subscription' } }, { status: 409 })
  const created = await prisma.subscription.create({
    data: {
      studentId: body.studentId,
      packageId: body.packageId,
      subscriptionType: body.subscriptionType,
      assignedTeacherId: body.assignedTeacherId,
      groupId: body.groupId,
      capacity: body.capacity ?? pkg.capacity,
      startDate: body.startDate,
      endDate: body.endDate,
      adminNotes: body.adminNotes,
      status: 'PENDING',
      lessonsAvailable: pkg.lessonsCount,
    },
  })
  await recordAuditEvent({ action: 'SUBSCRIPTION_CHANGE', userId: access.userId, details: { subscriptionId: created.id, studentId: body.studentId, action: 'CREATED' } }).catch(() => undefined)
  return NextResponse.json(created, { status: 201 })
}