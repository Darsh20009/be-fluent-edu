import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const level = await prisma.level.findUnique({ where: { id }, include: { stages: { orderBy: { order: 'asc' } } } })
  if (!level) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Level not found' } }, { status: 404 })
  return NextResponse.json(level)
}