import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    // Get ALL subscriptions assigned to this teacher (any status/payment status)
    const subscriptions = await prisma.subscription.findMany({
      where: {
        assignedTeacherId: teacher.teacherProfileId
      },
      include: {
        User: {
          include: {
            StudentProfile: true
          }
        },
        Package: {
          select: {
            title: true,
            durationDays: true
          }
        }
      }
    })

    const students = subscriptions.map(subscription => {
      const user = subscription.User
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        isAssignedToMe: true,
        studentProfile: user.StudentProfile || {
          levelCurrent: null,
          levelInitial: null,
          goal: null,
          targetLevel: null
        },
        sessionsCount: 0,
        wordsCount: 0,
        activeSubscription: subscription.endDate && new Date(subscription.endDate) > new Date() ? {
          packageTitle: subscription.Package.title,
          endDate: subscription.endDate.toISOString(),
          lessonsRemaining: subscription.Package.durationDays
        } : null
      }
    })
    
    // Remove duplicates by id
    const uniqueStudents = Array.from(
      new Map(students.map(s => [s.id, s])).values()
    )

    return NextResponse.json(uniqueStudents)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
