import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { canCreateEmployeeAccounts } from '@/lib/authorization'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72),
  role: z.enum(['TEACHER', 'STAFF']),
  phone: z.string().trim().max(32).optional().default(''),
  bio: z.string().trim().max(1000).optional().default(''),
})

export async function GET(request: NextRequest) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const search = request.nextUrl.searchParams.get('search')?.trim()
  const staff = await prisma.user.findMany({
    where: {
      role: { in: ['STAFF', 'ASSISTANT', 'MANAGER'] },
      ...(search ? { OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ] } : {}),
    },
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, email: true, phone: true, status: true, isActive: true,
      staffPermissions: { where: { granted: true }, select: { id: true, permission: true, scope: true } },
    },
  })
  return NextResponse.json({ items: staff, total: staff.length })
}

export async function POST(request: NextRequest) {
  const access = await requirePermission('teacher.createEmployeeAccounts')
  if (isNextResponse(access)) return access
  if (!canCreateEmployeeAccounts(access.role)) {
    return NextResponse.json({ ok: false, error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_REQUEST' } }, { status: 400 })
  }

  const parsed = createEmployeeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({
      ok: false,
      error: { code: 'INVALID_EMPLOYEE', details: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
    }, { status: 400 })
  }

  const input = parsed.data
  const email = input.email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ ok: false, error: { code: 'EMAIL_IN_USE' } }, { status: 409 })
  }

  try {
    const passwordHash = await bcrypt.hash(input.password, 12)
    const employee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email,
          passwordHash,
          phone: input.phone || null,
          role: input.role,
          isActive: true,
          status: 'ACTIVE',
          passwordSetupRequired: false,
        },
        select: { id: true, name: true, email: true, role: true },
      })

      if (input.role === 'TEACHER') {
        await tx.teacherProfile.create({
          data: { userId: user.id, bio: input.bio || null },
        })
      }

      await tx.auditLog.create({
        data: {
          action: 'Employee account created',
          userId: access.userId,
          details: `Created ${input.role} account for ${input.name} (${email})`,
        },
      })

      return user
    })

    return NextResponse.json({ ok: true, employee }, { status: 201 })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ ok: false, error: { code: 'EMAIL_IN_USE' } }, { status: 409 })
    }
    console.error('Employee account creation failed:', error)
    return NextResponse.json({ ok: false, error: { code: 'EMPLOYEE_CREATE_FAILED' } }, { status: 500 })
  }
}