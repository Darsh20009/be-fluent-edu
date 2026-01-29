import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params
    const body = await parseJsonBody<{ lessonsAvailable: number }>(request)
    if (isNextResponse(body)) return body

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: { lessonsAvailable: body.lessonsAvailable }
    })

    return NextResponse.json(updatedSubscription)
  } catch (error) {
    console.error('Error updating balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
