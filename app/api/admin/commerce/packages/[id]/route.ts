import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { packageUpdateSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.managePackages')
  if (isNextResponse(access)) return access
  const { id } = await params
  const item = await prisma.package.findUnique({
    where: { id },
    include: { level: true, stage: true, Subscription: true, Enrollment: true },
  })
  if (!item) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Package not found' } }, { status: 404 })
  return NextResponse.json({ ...item, features: item.featuresJson ? JSON.parse(item.featuresJson) : [] })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.managePackages')
  if (isNextResponse(access)) return access
  const parsed = packageUpdateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { id } = await params
  const { features, ...data } = parsed.data
  if (data.stageId) {
    const stage = await prisma.levelStage.findUnique({ where: { id: data.stageId } })
    if (!stage || stage.levelId !== data.levelId || !stage.isActive) {
      return NextResponse.json({ ok: false, error: { code: 'STAGE_MISMATCH', message: 'Stage does not belong to the selected level' } }, { status: 409 })
    }
  }
  const item = await prisma.package.update({
    where: { id },
    data: { ...data, ...(features ? { featuresJson: JSON.stringify(features) } : {}) },
  })
  await recordAuditEvent({ action: 'PACKAGE_CHANGE', userId: access.userId, details: { packageId: id, action: item.isActive ? 'UPDATED' : 'DEACTIVATED', fields: Object.keys(parsed.data) } }).catch(() => undefined)
  return NextResponse.json({ ...item, features: item.featuresJson ? JSON.parse(item.featuresJson) : [] })
}