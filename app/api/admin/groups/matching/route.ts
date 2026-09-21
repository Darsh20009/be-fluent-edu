import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { matchingSchema, phase5DatabaseGuard, rankMatchingGroups, validationError } from '@/lib/phase5'

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.manageGroups')
  if (isNextResponse(access)) return access
  const parsed = matchingSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const body = parsed.data
  const groups = await prisma.learningGroup.findMany({
    where: {
      status: 'ACTIVE',
      subscriptionType: body.subscriptionType,
      ...(body.levelId ? { levelId: body.levelId } : {}),
      ...(body.stageId ? { stageId: body.stageId } : {}),
    },
    include: { members: { where: { status: 'ACTIVE' } }, schedules: true },
  })
  const candidates = rankMatchingGroups(
    groups.map((group) => ({
      id: group.id,
      levelId: group.levelId,
      stageId: group.stageId,
      subscriptionType: group.subscriptionType,
      teacherProfileId: group.teacherProfileId,
      capacity: group.capacity,
      activeMemberCount: group.members.length,
      status: group.status,
      schedules: group.schedules,
    })),
    body,
  )
  return NextResponse.json({ candidates })
}