import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import { hashPlacementTicket } from '@/lib/placement-ticket'

export async function resolvePlacementAccess(request: NextRequest) {
  const session = await requirePermission('student.editProfile')
  if (!isNextResponse(session)) {
    return { userId: session.userId, ticketId: null as string | null, response: null }
  }
  if (session.status !== 401) {
    return { userId: null, ticketId: null, response: session }
  }

  const token = request.headers.get('x-placement-ticket') || request.cookies.get('bf-placement-ticket')?.value
  if (!token || token.length > 200) {
    return { userId: null, ticketId: null, response: session }
  }

  const ticket = await prisma.placementTestTicket.findUnique({
    where: { tokenHash: hashPlacementTicket(token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
      user: { select: { role: true } },
    },
  })
  if (
    !ticket
    || ticket.user.role !== 'STUDENT'
    || ticket.usedAt
    || ticket.expiresAt.getTime() <= Date.now()
  ) {
    return {
      userId: null,
      ticketId: null,
      response: NextResponse.json({ error: 'Placement access expired. Please sign in or contact support.' }, { status: 401 }),
    }
  }
  return { userId: ticket.userId, ticketId: ticket.id, response: null }
}