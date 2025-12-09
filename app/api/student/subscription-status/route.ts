import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ 
        hasApprovedSubscription: false,
        isSubscribed: false 
      }, { status: 200 })
    }

    // Find active, approved subscription for the student
    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId: session.user.id,
        status: 'APPROVED',
        paid: true,
        AssignedTeacher: {
          isNot: null
        }
      },
      include: {
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
      return NextResponse.json({
        hasApprovedSubscription: false,
        isSubscribed: false,
        message: 'No active subscription found'
      }, { status: 200 })
    }

    // Check if subscription has expired
    const now = new Date()
    const isExpired = subscription.endDate ? new Date(subscription.endDate) < now : false

    if (isExpired) {
      return NextResponse.json({
        hasApprovedSubscription: false,
        isSubscribed: false,
        message: 'Subscription has expired',
        subscription: {
          id: subscription.id,
          endDate: subscription.endDate,
          expiredAt: subscription.endDate
        }
      }, { status: 200 })
    }

    // Check if subscription hasn't started yet
    const hasStarted = subscription.startDate ? new Date(subscription.startDate) <= now : true

    // Calculate remaining lessons
    const lessonsRemaining = subscription.lessonsAvailable - subscription.lessonsTaken

    console.log(`📊 Subscription status for ${session.user.id}:`, {
      lessonsAvailable: subscription.lessonsAvailable,
      lessonsTaken: subscription.lessonsTaken,
      lessonsRemaining: lessonsRemaining
    })

    return NextResponse.json({
      hasApprovedSubscription: true,
      isSubscribed: true,
      isActive: hasStarted && !isExpired,
      subscription: {
        id: subscription.id,
        packageId: subscription.packageId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        lessonsAvailable: subscription.lessonsAvailable,
        lessonsTaken: subscription.lessonsTaken,
        lessonsRemaining: lessonsRemaining,
        package: subscription.Package,
        assignedTeacher: subscription.AssignedTeacher?.User
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json({
      hasApprovedSubscription: false,
      isSubscribed: false,
      error: 'Internal server error'
    }, { status: 200 })
  }
}
