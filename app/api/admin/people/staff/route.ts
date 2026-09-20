import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

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