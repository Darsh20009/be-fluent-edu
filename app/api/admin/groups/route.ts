import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { groupCreateSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const status = request.nextUrl.searchParams.get('status') || undefined
  const items = await prisma.learningGroup.findMany({
    where: { status },
    include: {
      level: true,
      stage: true,
      teacher: { include: { User: true } },
      schedules: true,
      members: {
        where: {
          status: 'ACTIVE',
          role: 'STUDENT',
          user: { role: 'STUDENT', isActive: true },
        },
        include: { user: true },
      },
      enrollments: { where: { status: 'ACTIVE' }, select: { studentId: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = groupCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data

  if (body.levelId) {
    const level = await prisma.level.findUnique({ where: { id: body.levelId } })
    if (!level || !level.isActive) return NextResponse.json({ ok: false, error: { code: 'LEVEL_NOT_FOUND', message: 'Active level not found' } }, { status: 404 })
  }
  if (body.stageId) {
    const stage = await prisma.levelStage.findUnique({ where: { id: body.stageId } })
    if (!stage || stage.levelId !== body.levelId || !stage.isActive) {
      return NextResponse.json({ ok: false, error: { code: 'STAGE_MISMATCH', message: 'Stage does not belong to the selected level' } }, { status: 409 })
    }
  }
  if (body.teacherProfileId) {
    const teacher = await prisma.teacherProfile.findUnique({ where: { id: body.teacherProfileId } })
    if (!teacher) return NextResponse.json({ ok: false, error: { code: 'TEACHER_NOT_FOUND', message: 'Teacher not found' } }, { status: 404 })
  }

  const group = await prisma.learningGroup.create({ data: body })
  await recordAuditEvent({ action: 'GROUP_CHANGE', userId: access.userId, details: { groupId: group.id, action: 'CREATED' } }).catch(() => undefined)
  return NextResponse.json(group, { status: 201 })
}