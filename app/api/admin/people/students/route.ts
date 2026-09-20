import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

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