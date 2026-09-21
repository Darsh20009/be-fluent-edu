import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { mistakeLibrarySchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
export async function GET(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedbackLibraries'); if (isNextResponse(access)) return access
  const q = request.nextUrl.searchParams.get('q') || undefined
  const items = await prisma.mistakeTemplate.findMany({ where: q ? { OR: [{ incorrectExpression: { contains: q, mode: 'insensitive' } }, { correctedExpression: { contains: q, mode: 'insensitive' } }, { category: { contains: q, mode: 'insensitive' } }] } : undefined, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ items })
}
export async function POST(request: NextRequest) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedbackLibraries'); if (isNextResponse(access)) return access
  const parsed = mistakeLibrarySchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  return NextResponse.json(await prisma.mistakeTemplate.create({ data: { ...parsed.data, createdById: access.userId } }), { status: 201 })
}