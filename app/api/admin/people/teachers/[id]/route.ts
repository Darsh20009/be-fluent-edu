import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { profilePatchSchema } from '@/lib/phase4'
import { recordAuditEvent } from '@/lib/audit'
import { normalizePhone } from '@/lib/validation'
import { z } from 'zod'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const teacher = await prisma.user.findFirst({
    where: { id, role: { in: ['TEACHER', 'ADMIN'] } },
    select: {
      id: true, name: true, email: true, phone: true, profilePhoto: true, status: true,
      isActive: true, createdAt: true, TeacherProfile: true,
    },
  })
  if (!teacher) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Teacher not found' } }, { status: 404 })
  return NextResponse.json(teacher)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const body = profilePatchSchema.extend({
    bio: z.string().max(4000).nullable().optional(),
    subjects: z.string().max(2000).nullable().optional(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'DISABLED', 'PENDING']).optional(),
  }).parse(await request.json())
  const userData = Object.fromEntries(Object.entries(body).filter(([key]) => ['name', 'email', 'phone', 'profilePhoto', 'status'].includes(key)))
  if (userData.phone) userData.phone = normalizePhone(String(userData.phone))
  const profileData = Object.fromEntries(Object.entries(body).filter(([key]) => ['bio', 'subjects'].includes(key)))
  const updated = await prisma.user.update({ where: { id }, data: userData })
  if (Object.keys(profileData).length) await prisma.teacherProfile.update({ where: { userId: id }, data: profileData })
  await recordAuditEvent({ action: 'TEACHER_PROFILE_CHANGE', userId: access.userId, details: { teacherId: id, fields: Object.keys(body) } }).catch(() => undefined)
  return NextResponse.json(updated)
}