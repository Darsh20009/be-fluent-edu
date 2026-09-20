import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'

export async function GET() {
  const access = await requireStudent()
  if (isNextResponse(access)) return access
  const profile = await prisma.studentLearningProfile.findUnique({
    where: { userId: access.userId },
    include: { officialLevel: true, officialStage: true, recommendedLevel: true, recommendedStage: true },
  })
  return NextResponse.json(profile)
}