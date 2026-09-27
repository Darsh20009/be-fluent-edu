import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { goalsSchema } from '@/lib/phase4'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { persistSavedStudentGoals } from '@/lib/phase9/pipeline'

export async function PATCH(request: NextRequest) {
  const blocked = phase9DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('student.editGoals')
  if (isNextResponse(access)) return access
  const goals = goalsSchema.parse(await request.json())
  const profile = await prisma.$transaction(async (tx) => {
    const studentProfile = await tx.studentProfile.upsert({
      where: { userId: access.userId },
      create: { userId: access.userId, goal: goals.overallGoal ?? null },
      update: { goal: goals.overallGoal ?? null },
    })
    const learningProfile = await tx.studentLearningProfile.upsert({
      where: { userId: access.userId },
      create: { userId: access.userId, studentProfileId: studentProfile.id, goalsJson: JSON.stringify(goals) },
      update: { goalsJson: JSON.stringify(goals) },
    })
    await persistSavedStudentGoals(tx, access.userId)
    return learningProfile
  })
  return NextResponse.json({ goals, profile })
}