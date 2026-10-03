import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-helpers'

export async function POST() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: session.userId,
      channel: 'IN_APP',
      OR: [{ readAt: null }, { readAt: { isSet: false } }],
    },
    data: { readAt: new Date() },
  })
  return NextResponse.json({ ok: true, updated: result.count })
}