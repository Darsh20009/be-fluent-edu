import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { groupProposalDecisionSchema, groupProposalTransition, phase5DatabaseGuard, validationError } from '@/lib/phase5'
import { queuePhase7Notifications } from '@/lib/phase7-notifications'

export async function GET() {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access

  const proposal = await prisma.enrollment.findFirst({
    where: { studentId: access.userId, status: { in: ['PROPOSED', 'STUDENT_ACCEPTED'] } },
    include: {
      group: {
        include: {
          level: { select: { code: true, name: true } },
          stage: { select: { code: true, name: true } },
          teacher: { include: { User: { select: { name: true } } } },
          schedules: { where: { status: 'ACTIVE' }, orderBy: [{ dayOfWeek: 'asc' }, { startMinute: 'asc' }] },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (proposal) {
    return NextResponse.json({
      status: proposal.status,
      proposal: {
        id: proposal.id,
        groupId: proposal.groupId,
        subscriptionType: proposal.subscriptionType,
        group: proposal.group ? {
          id: proposal.group.id,
          name: proposal.group.name,
          nameAr: proposal.group.nameAr,
          level: proposal.group.level,
          stage: proposal.group.stage,
          teacherName: proposal.group.teacher?.User.name || null,
          schedules: proposal.group.schedules,
        } : null,
      },
      waitlist: null,
    })
  }

  const waitlistSubscription = await prisma.subscription.findFirst({
    where: {
      studentId: access.userId,
      status: 'APPROVED',
      groupId: null,
      OR: [{ subscriptionType: 'DUO' }, { subscriptionType: null, Package: { subscriptionType: 'DUO' } }],
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, subscriptionType: true },
  })
  if (!waitlistSubscription) return NextResponse.json({ status: 'NONE', proposal: null, waitlist: null })

  return NextResponse.json({
    status: 'WAITING',
    proposal: null,
    waitlist: {
      subscriptionId: waitlistSubscription.id,
      createdAt: waitlistSubscription.createdAt,
      subscriptionType: 'DUO',
    },
  })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const parsed = groupProposalDecisionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)

  const existing = await prisma.enrollment.findFirst({
    where: { id: parsed.data.enrollmentId, studentId: access.userId },
    select: { id: true, status: true, groupId: true },
  })
  if (!existing) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 })
  const nextStatus = groupProposalTransition(existing.status, parsed.data.decision)
  if (!nextStatus) return NextResponse.json({ ok: false, error: { code: 'INVALID_TRANSITION' } }, { status: 409 })

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
    take: 25,
  })
  const updated = await prisma.$transaction(async (tx) => {
    const changed = await tx.enrollment.updateMany({
      where: { id: existing.id, studentId: access.userId, status: existing.status },
      data: { status: nextStatus },
    })
    if (changed.count !== 1) return false
    await Promise.all(admins.map((admin) => queuePhase7Notifications({
      event: 'group.proposal',
      entityId: existing.id,
      recipientUserId: admin.id,
      title: parsed.data.decision === 'ACCEPT' ? 'A student accepted a group suggestion' : 'A student declined a group suggestion',
      body: parsed.data.decision === 'ACCEPT' ? 'Review and confirm the group assignment.' : 'Review the declined suggestion and consider another match.',
      payload: {
        href: '/dashboard/admin/commerce',
        titleAr: parsed.data.decision === 'ACCEPT' ? 'وافق طالب على اقتراح المجموعة' : 'اعتذر طالب عن اقتراح المجموعة',
        bodyAr: parsed.data.decision === 'ACCEPT' ? 'راجع التعيين وأكده من مساحة التجارة.' : 'راجع الاقتراح المرفوض وابحث عن خيار آخر.',
      },
    }, tx)))
    return true
  })
  if (!updated) return NextResponse.json({ ok: false, error: { code: 'CONFLICT' } }, { status: 409 })
  return NextResponse.json({ ok: true, status: nextStatus })
}