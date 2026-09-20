import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

export async function GET() {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const levels = await prisma.level.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { stages: { where: { isActive: true }, orderBy: { order: 'asc' } } },
  })
  return NextResponse.json(levels)
}