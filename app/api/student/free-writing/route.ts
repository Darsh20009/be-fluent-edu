import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const writings = await prisma.freeWriting.findMany({
      where: { studentId: student.userId },
      include: {
        TeacherProfile: {
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
      orderBy: { submittedAt: 'desc' }
    })

    return NextResponse.json({ writings }, { status: 200 })
  } catch (error) {
    console.error('Error fetching free writings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Get the student's assigned teacher
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: student.userId,
        status: 'APPROVED',
        paid: true
      },
      include: {
        AssignedTeacher: true
      },
      orderBy: {
        approvedAt: 'desc'
      }
    })

    const writing = await prisma.freeWriting.create({
      data: {
        studentId: student.userId,
        title,
        content,
        teacherId: activeSubscription?.assignedTeacherId || null
      },
      include: {
        TeacherProfile: {
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

    return NextResponse.json({ writing }, { status: 201 })
  } catch (error) {
    console.error('Error creating free writing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
