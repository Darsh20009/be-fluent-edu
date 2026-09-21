import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { packageCreateSchema, phase5DatabaseGuard, validationError } from '@/lib/phase5'

export async function GET(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.managePackages')
  if (isNextResponse(access)) return access
  const active = request.nextUrl.searchParams.get('active')
  const items = await prisma.package.findMany({
    where: active == null ? undefined : { isActive: active === 'true' },
    include: { level: true, stage: true, _count: { select: { Subscription: true, Enrollment: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items: items.map((item) => ({ ...item, features: item.featuresJson ? JSON.parse(item.featuresJson) : [] })) })
}

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.managePackages')
  if (isNextResponse(access)) return access
  const parsed = packageCreateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return validationError(parsed.error)
  const { features, ...data } = parsed.data
  if (data.stageId) {
    const stage = await prisma.levelStage.findUnique({ where: { id: data.stageId } })
    if (!stage || stage.levelId !== data.levelId || !stage.isActive) {
      return NextResponse.json({ ok: false, error: { code: 'STAGE_MISMATCH', message: 'Stage does not belong to the selected level' } }, { status: 409 })
    }
  }
  const created = await prisma.package.create({
    data: { ...data, featuresJson: JSON.stringify(features) },
  })
  await recordAuditEvent({ action: 'PACKAGE_CHANGE', userId: access.userId, details: { packageId: created.id, action: 'CREATED' } }).catch(() => undefined)
  return NextResponse.json({ ...created, features }, { status: 201 })
}