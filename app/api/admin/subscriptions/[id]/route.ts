import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id },
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
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const body = await parseJsonBody<{
      action: 'approve' | 'reject'
      assignedTeacherId?: string
      adminNotes?: string
    }>(request)
    if (isNextResponse(body)) return body

    const { action, assignedTeacherId, adminNotes } = body

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        Package: true
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.status !== 'UNDER_REVIEW' && subscription.status !== 'PENDING') {
      return NextResponse.json({ error: 'Subscription cannot be modified in current status' }, { status: 400 })
    }

    if (action === 'approve') {
      if (!assignedTeacherId) {
        return NextResponse.json({ error: 'Teacher assignment required for approval' }, { status: 400 })
      }

      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: assignedTeacherId }
      })

      if (!teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
      }

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + subscription.Package.durationDays)

      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'APPROVED',
          paid: true,
          assignedTeacherId: assignedTeacherId,
          approvedAt: new Date(),
          startDate: startDate,
          endDate: endDate,
          adminNotes: adminNotes,
          updatedAt: new Date()
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
        }
      })

      return NextResponse.json(updatedSubscription)
    }

    if (action === 'reject') {
      const updatedSubscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
          adminNotes: adminNotes,
          updatedAt: new Date()
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
          Package: true
        }
      })

      return NextResponse.json(updatedSubscription)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    const { id } = await params

    const existingSubscription = await prisma.subscription.findUnique({
      where: { id }
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    await prisma.subscription.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
