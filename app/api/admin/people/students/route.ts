import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requireAdmin, requirePermission } from '@/lib/auth-helpers'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { phoneSchema } from '@/lib/validation'
import { recordAuditEvent } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'

const preferredDays = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const
const createStudentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.union([z.string().trim().email().max(255), z.literal('')]).optional(),
  phone: z.union([z.string().trim().min(10).max(30), z.literal('')]).optional(),
  packageId: z.string().trim().min(1),
  age: z.number().int().min(5).max(100).nullable().optional(),
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  preferredDays: z.array(z.enum(preferredDays)).min(1).max(7),
}).refine((value) => Boolean(value.email?.trim() || value.phone?.trim()), {
  message: 'Enter an email address or phone number.',
  path: ['email'],
}).refine((value) => new Set(value.preferredDays).size === value.preferredDays.length, {
  message: 'Preferred days must be unique.',
  path: ['preferredDays'],
})

export async function GET(request: NextRequest) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access

  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number(params.get('page') || 1))
  const pageSize = Math.min(50, Math.max(1, Number(params.get('pageSize') || 20)))
  const search = params.get('search')?.trim()
  const status = params.get('status')?.trim()
  const levelId = params.get('levelId')?.trim()
  const stageId = params.get('stageId')?.trim()

  const where = {
    role: 'STUDENT',
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(levelId || stageId
      ? {
          StudentProfile: {
            is: {
              ...(levelId ? { officialLevelId: levelId } : {}),
              ...(stageId ? { officialStageId: stageId } : {}),
            },
          },
        }
      : {}),
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, name: true, email: true, phone: true, profilePhoto: true,
        status: true, isActive: true, createdAt: true,
        StudentProfile: {
          select: {
            id: true, age: true, goal: true, officialLevelId: true, officialStageId: true,
            officialLevel: { select: { code: true, name: true, nameAr: true } },
            officialStage: { select: { code: true, name: true, nameAr: true } },
          },
        },
      },
    }),
  ])

  return NextResponse.json({ items: users, page, pageSize, total, totalPages: Math.ceil(total / pageSize) })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requireAdmin()
  if (isNextResponse(access)) return access
  const parsed = createStudentSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_STUDENT', message: 'Check the student details and try again.' } }, { status: 400 })
  }

  const input = parsed.data
  const email = input.email?.trim().toLowerCase()
  const parsedPhone = input.phone?.trim() ? phoneSchema.safeParse(input.phone) : null
  if (parsedPhone && !parsedPhone.success) {
    return NextResponse.json({ ok: false, error: { code: 'INVALID_PHONE', message: 'Enter a valid phone number.' } }, { status: 400 })
  }
  const phone = parsedPhone?.success ? parsedPhone.data : null
  const loginEmail = email || `${phone!.replace(/\D/g, '')}@phone.befluent.com`
  const duplicateConditions = [{ email: loginEmail }, ...(phone ? [{ normalizedPhone: phone }, { phone }] : [])]
  const duplicate = await prisma.user.findFirst({ where: { OR: duplicateConditions }, select: { id: true, email: true } })
  if (duplicate) {
    return NextResponse.json({ ok: false, error: { code: 'STUDENT_ALREADY_EXISTS', message: 'An account with this email or phone already exists.' } }, { status: 409 })
  }

  const packageItem = await prisma.package.findUnique({ where: { id: input.packageId } })
  if (!packageItem || !packageItem.isActive) {
    return NextResponse.json({ ok: false, error: { code: 'PACKAGE_NOT_AVAILABLE', message: 'Choose an active package.' } }, { status: 409 })
  }
  const packageLessonsPerWeek = packageItem?.lessonsPerWeek
  if (!packageItem.subscriptionType || packageItem.capacity == null || packageItem.capacity <= 0 ||
      packageLessonsPerWeek == null || packageLessonsPerWeek < 1) {
    return NextResponse.json({ ok: false, error: { code: 'PACKAGE_SCHEDULE_REQUIRED', message: 'Set the package type, capacity, and lessons per week before creating a student.' } }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(randomBytes(48).toString('base64url'), 10)
  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: loginEmail,
        phone,
        normalizedPhone: phone,
        passwordHash,
        role: 'STUDENT',
        isActive: true,
        status: 'ACTIVE',
        passwordSetupRequired: true,
        StudentProfile: {
          create: {
            age: input.age ?? null,
            packageId: packageItem.id,
            preferredTime: input.preferredTime,
          },
        },
      },
    })
    const subscription = await tx.subscription.create({
      data: {
        studentId: user.id,
        packageId: packageItem.id,
        subscriptionType: packageItem.subscriptionType,
        capacity: packageItem.capacity,
        lessonsAvailable: packageItem.lessonsCount,
        lessonsPerWeek: packageLessonsPerWeek,
        preferredDays: JSON.stringify(input.preferredDays),
        status: 'PENDING',
        paid: false,
      },
    })
    return { user, subscription }
  })

  await recordAuditEvent({
    action: 'ADMIN_ACTION',
    userId: access.userId,
    details: { domain: 'STUDENT_ONBOARDING', event: 'ACCOUNT_CREATED', studentId: created.user.id, subscriptionId: created.subscription.id, packageId: packageItem.id },
  }).catch(() => undefined)

  return NextResponse.json({
    user: {
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
      phone: created.user.phone,
      status: created.user.status,
      isActive: created.user.isActive,
      passwordSetupRequired: created.user.passwordSetupRequired,
    },
    subscription: {
      id: created.subscription.id,
      status: created.subscription.status,
      packageId: packageItem.id,
      packageTitle: packageItem.title,
      packageTitleAr: packageItem.titleAr,
    },
  }, { status: 201 })
}