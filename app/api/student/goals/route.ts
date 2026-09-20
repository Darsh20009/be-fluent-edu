import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { goalsSchema } from '@/lib/phase4'

export async function PATCH(request: NextRequest) {
  const access = await requirePermission('student.editGoals')
  if (isNextResponse(access)) return access
  const goals = goalsSchema.parse(await request.json())
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: access.userId },
    create: { userId: access.userId, goal: goals.overallGoal ?? null },
    update: { goal: goals.overallGoal ?? null },
  })
  const profile = await prisma.studentLearningProfile.upsert({
    where: { userId: access.userId },
    create: { userId: access.userId, studentProfileId: studentProfile.id, goalsJson: JSON.stringify(goals) },
    update: { goalsJson: JSON.stringify(goals) },
  })
  return NextResponse.json({ goals, profile })
}