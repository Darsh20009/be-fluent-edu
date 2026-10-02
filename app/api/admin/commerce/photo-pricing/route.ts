import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { recordAuditEvent } from '@/lib/audit'
import { phase5DatabaseGuard } from '@/lib/phase5'
import { buildPhotoPricing } from '@/lib/photo-pricing'

const requestSchema = z.object({ lessonsPerWeek: z.number().int().min(1).max(7) })

export async function POST(request: NextRequest) {
  const blocked = phase5DatabaseGuard()
  if (blocked) return blocked
  const access = await requirePermission('admin.managePackages')
  if (isNextResponse(access)) return access
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false, error: { code: 'INVALID_LESSONS_PER_WEEK' } }, { status: 400 })

  const packages = buildPhotoPricing(parsed.data.lessonsPerWeek)
  const existing = await prisma.package.findMany({
    where: { title: { in: packages.map((item) => item.title) } },
    select: { id: true, title: true },
  })
  if (existing.length) {
    return NextResponse.json({
      ok: false,
      error: { code: 'PHOTO_PRICING_ALREADY_EXISTS', message: 'Review existing package titles before importing this pricing set.' },
      existing,
    }, { status: 409 })
  }

  const created = await prisma.$transaction(
    packages.map(({ featuresJson, ...item }) => prisma.package.create({ data: { ...item, featuresJson } })),
  )
  await recordAuditEvent({
    action: 'ADMIN_ACTION',
    userId: access.userId,
    details: { domain: 'COMMERCE', event: 'PHOTO_PRICING_IMPORTED', packageIds: created.map((item) => item.id), lessonsPerWeek: parsed.data.lessonsPerWeek },
  }).catch(() => undefined)
  return NextResponse.json({ items: created }, { status: 201 })
}