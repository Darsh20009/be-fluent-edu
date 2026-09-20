import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { z } from 'zod'
import { recordAuditEvent } from '@/lib/audit'

const permissionsSchema = z.object({
  permissions: z.array(z.object({
    permission: z.string().min(1).max(120),
    scope: z.string().max(200).nullable().optional(),
  })).max(100),
})

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) return access
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: { id, role: { in: ['STAFF', 'ASSISTANT', 'MANAGER'] } },
    select: { id: true, name: true, email: true, phone: true, status: true, isActive: true,
      staffPermissions: { where: { granted: true } } },
  })
  if (!user) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Staff member not found' } }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission('admin.manageStaffPermissions')
  if (isNextResponse(access)) return access
  const { id } = await params
  const body = permissionsSchema.parse(await request.json())
  const target = await prisma.user.findFirst({ where: { id, role: { in: ['STAFF', 'ASSISTANT', 'MANAGER'] } } })
  if (!target) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Staff member not found' } }, { status: 404 })
  await prisma.staffPermission.deleteMany({ where: { userId: id } })
  if (body.permissions.length) {
    await prisma.staffPermission.createMany({
      data: body.permissions.map((permission) => ({ userId: id, permission: permission.permission, scope: permission.scope ?? null, granted: true })),
    })
  }
  await recordAuditEvent({ action: 'PERMISSION_CHANGE', userId: access.userId, details: { targetUserId: id, permissionCount: body.permissions.length } }).catch(() => undefined)
  return NextResponse.json({ ok: true, userId: id, permissions: body.permissions })
}