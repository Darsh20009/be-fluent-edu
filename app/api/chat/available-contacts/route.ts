import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const contacts: any[] = []

    if (session.user.role === 'STUDENT') {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          role: true
        }
      })
      contacts.push(...admins)

      const subscription = await prisma.subscription.findFirst({
        where: {
          studentId: userId,
          paid: true,
          status: 'APPROVED',
          assignedTeacherId: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (subscription?.assignedTeacherId) {
        const teacherProfile = await prisma.teacherProfile.findUnique({
          where: { id: subscription.assignedTeacherId },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                role: true
              }
            }
          }
        })

        if (teacherProfile?.User) {
          contacts.push(teacherProfile.User)
        }
      }
    } else if (session.user.role === 'TEACHER') {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (teacherProfile) {
        const subscriptions = await prisma.subscription.findMany({
          where: {
            assignedTeacherId: teacherProfile.id,
            paid: true,
            status: 'APPROVED'
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhoto: true,
                role: true
              }
            }
          }
        })

        const students = subscriptions.map(sub => sub.User)
        contacts.push(...students)
      }

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          role: true
        }
      })
      contacts.push(...admins)
    } else if (session.user.role === 'ADMIN') {
      const allUsers = await prisma.user.findMany({
        where: {
          id: { not: userId },
          isActive: true,
          role: { in: ['STUDENT', 'TEACHER'] }
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
          role: true
        }
      })
      contacts.push(...allUsers)
    }

    const uniqueContacts = Array.from(
      new Map(contacts.map(c => [c.id, c])).values()
    )

    return NextResponse.json({ contacts: uniqueContacts })
  } catch (error) {
    console.error('Error fetching available contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}
