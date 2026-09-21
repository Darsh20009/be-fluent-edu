import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { ebiLibrarySchema, phase7DatabaseGuard } from '@/lib/phase7'
import { validationError } from '@/lib/phase5'
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedbackLibraries'); if (isNextResponse(access)) return access
  const parsed = ebiLibrarySchema.partial().safeParse(await request.json().catch(() => null)); if (!parsed.success) return validationError(parsed.error)
  return NextResponse.json(await prisma.eBILibraryItem.update({ where: { id: (await params).id }, data: parsed.data }))
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase7DatabaseGuard(); if (blocked) return blocked
  const access = await requirePermission('admin.manageFeedbackLibraries'); if (isNextResponse(access)) return access
  return NextResponse.json(await prisma.eBILibraryItem.update({ where: { id: (await params).id }, data: { status: 'INACTIVE' } }))
}