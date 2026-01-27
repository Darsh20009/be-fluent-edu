import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (isNextResponse(admin)) return admin

    // Query teachers from Users table to avoid orphaned TeacherProfile records
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        // Removed isActive filter to show all teachers in admin dashboard
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        TeacherProfile: {
          select: {
            id: true,
            bio: true,
            subjects: true,
            AssignedSubscriptions: {
              where: {
                status: 'APPROVED',
                paid: true
              },
              select: {
                id: true,
                User: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Format response to include teacher profile data
    const formattedTeachers = teachers.map(user => ({
      ...user.TeacherProfile,
      User: user,
      AssignedSubscriptions: user.TeacherProfile?.AssignedSubscriptions || []
    }))

    return NextResponse.json(formattedTeachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
