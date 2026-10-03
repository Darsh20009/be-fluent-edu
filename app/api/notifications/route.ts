import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-helpers'
import { safeLocalNotificationHref } from '@/lib/notifications/view'

function payloadDetails(value: string | null) {
  if (!value) return { href: null, titleAr: null, bodyAr: null }
  try {
    const payload: unknown = JSON.parse(value)
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { href: null, titleAr: null, bodyAr: null }
    const data = payload as Record<string, unknown>
    return {
      href: safeLocalNotificationHref(data.href),
      titleAr: typeof data.titleAr === 'string' ? data.titleAr.slice(0, 240) : null,
      bodyAr: typeof data.bodyAr === 'string' ? data.bodyAr.slice(0, 2000) : null,
    }
  } catch {
    return { href: null, titleAr: null, bodyAr: null }
  }
}

export async function GET() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.userId, channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, eventType: true, title: true, body: true, payloadJson: true, readAt: true, createdAt: true },
    }),
    prisma.notification.count({
      where: {
        userId: session.userId,
        channel: 'IN_APP',
        OR: [{ readAt: null }, { readAt: { isSet: false } }],
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    unreadCount,
    items: rows.map(({ payloadJson, ...row }) => ({ ...row, ...payloadDetails(payloadJson) })),
  })
}