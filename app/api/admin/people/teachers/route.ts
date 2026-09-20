import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const params = request.nextUrl.searchParams
  const search = params.get('search')?.trim()
  const status = params.get('status')?.trim()
  const where = {
    role: { in: ['TEACHER', 'ADMIN'] },
    ...(status ? { status } : {}),
    ...(search ? { OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
      { phone: { contains: search, mode: 'insensitive' as const } },
    ] } : {}),
  }
  const teachers = await prisma.user.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true, name: true, email: true, phone: true, profilePhoto: true,
      status: true, isActive: true, createdAt: true,
      TeacherProfile: { select: { id: true, bio: true, subjects: true } },
    },
  })
  return NextResponse.json({ items: teachers, total: teachers.length })
}