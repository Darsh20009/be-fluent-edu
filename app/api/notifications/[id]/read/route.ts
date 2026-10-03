import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-helpers'

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const { id } = await context.params
  const result = await prisma.notification.updateMany({
    where: { id, userId: session.userId, channel: 'IN_APP', OR: [{ readAt: null }, { readAt: { isSet: false } }] },
    data: { readAt: new Date() },
  })
  if (!result.count) {
    const owned = await prisma.notification.findFirst({
      where: { id, userId: session.userId, channel: 'IN_APP' },
      select: { id: true },
    })
    if (!owned) return NextResponse.json({ ok: false, error: { code: 'NOT_FOUND' } }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}