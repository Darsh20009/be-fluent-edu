import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { normalizePhone } from '@/lib/validation'
import { studentProfilePatchSchema } from '@/lib/phase4'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { persistSavedStudentGoals } from '@/lib/phase9/pipeline'

async function studentId() {
  const access = await requirePermission('student.editProfile')
  return access
}

export async function GET() {
  const access = await studentId()
  if (isNextResponse(access)) return access
  const user = await prisma.user.findUnique({
    where: { id: access.userId },
    select: {
      id: true, name: true, email: true, phone: true, profilePhoto: true, status: true, createdAt: true,
      StudentProfile: { include: { officialLevel: true, officialStage: true, learningProfile: true } },
    },
  })
  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest) {
  const access = await studentId()
  if (isNextResponse(access)) return access
  const body = studentProfilePatchSchema.parse(await request.json())
  if (body.goal !== undefined) {
    const blocked = phase9DatabaseGuard()
    if (blocked) return blocked
  }
  const userData: Record<string, unknown> = {}
  for (const key of ['name', 'email', 'profilePhoto'] as const) if (body[key] !== undefined) userData[key] = body[key]
  if (body.phone !== undefined) userData.phone = body.phone ? normalizePhone(body.phone) : null
  const profileData: Record<string, unknown> = {}
  for (const key of ['age', 'gender', 'nationality', 'goal'] as const) if (body[key] !== undefined) profileData[key] = body[key]
  if (body.goal !== undefined) {
    const updated = await prisma.$transaction(async (tx) => {
      const user = Object.keys(userData).length
        ? await tx.user.update({ where: { id: access.userId }, data: userData })
        : await tx.user.findUniqueOrThrow({ where: { id: access.userId } })
      await tx.studentProfile.upsert({
        where: { userId: access.userId },
        create: { userId: access.userId, ...profileData },
        update: profileData,
      })
      await persistSavedStudentGoals(tx, access.userId)
      return user
    })
    return NextResponse.json(updated)
  }
  const updated = Object.keys(userData).length
    ? await prisma.user.update({ where: { id: access.userId }, data: userData })
    : await prisma.user.findUniqueOrThrow({ where: { id: access.userId } })
  if (Object.keys(profileData).length) {
    await prisma.studentProfile.upsert({
      where: { userId: access.userId },
      create: { userId: access.userId, ...profileData },
      update: profileData,
    })
  }
  return NextResponse.json(updated)
}