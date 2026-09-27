import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { normalizePhone } from '@/lib/validation'
import { profilePatchSchema } from '@/lib/phase4'
import { recordAuditEvent } from '@/lib/audit'
import { phase9DatabaseGuard } from '@/lib/phase9/engine'
import { persistSavedStudentGoals } from '@/lib/phase9/pipeline'
import { z } from 'zod'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: { id, role: 'STUDENT' },
    select: {
      id: true, name: true, email: true, phone: true, profilePhoto: true, status: true,
      isActive: true, createdAt: true, StudentProfile: {
        include: {
          officialLevel: true,
          officialStage: true,
          recommendedLevel: true,
          recommendedStage: true,
          learningProfile: true,
        },
      },
    },
  })
  if (!user) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const body = profilePatchSchema.extend({
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING']).optional(),
  }).parse(await request.json())
  if (body.goal !== undefined) {
    const blocked = phase9DatabaseGuard()
    if (blocked) return blocked
  }
  const data: Record<string, unknown> = {}
  for (const key of ['name', 'email', 'profilePhoto', 'status', 'age', 'goal'] as const) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  if (body.phone !== undefined) data.phone = body.phone ? normalizePhone(body.phone) : null
  const current = await prisma.user.findFirst({ where: { id, role: 'STUDENT' }, include: { StudentProfile: true } })
  if (!current) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Student not found' } }, { status: 404 })
  const userData = Object.fromEntries(Object.entries(data).filter(([key]) => !['age', 'goal'].includes(key)))
  const profileData = Object.fromEntries(Object.entries(data).filter(([key]) => ['age', 'goal'].includes(key)))
  const updated = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: userData })
    if (Object.keys(profileData).length) {
      await tx.studentProfile.upsert({
        where: { userId: id },
        create: { userId: id, ...profileData },
        update: profileData,
      })
    }
    if (body.goal !== undefined) await persistSavedStudentGoals(tx, id)
    return user
  })
  await recordAuditEvent({ action: 'STUDENT_PROFILE_CHANGE', userId: access.userId, details: { studentId: id, fields: Object.keys(data) } }).catch(() => undefined)
  return NextResponse.json(updated)
}