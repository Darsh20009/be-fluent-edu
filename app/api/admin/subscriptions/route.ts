import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ASSISTANT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'UNDER_REVIEW' },
          { status: 'APPROVED' },
          { status: 'REJECTED' }
        ]
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        Package: true,
        AssignedTeacher: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter out subscriptions that might have lost their relations (shouldn't happen with Prisma, but for safety with MongoDB)
    const validSubscriptions = subscriptions.filter(sub => sub.User && sub.Package)

    return NextResponse.json(validSubscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
