import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const subscription = await prisma.subscription.findFirst({
      where: {
        studentId: student.userId,
        status: 'APPROVED',
        paid: true
      },
      include: {
        AssignedTeacher: true
      }
    })

    if (!subscription || !subscription.AssignedTeacher) {
      return NextResponse.json([])
    }

    const tests = await prisma.writingTest.findMany({
      where: {
        teacherId: subscription.AssignedTeacher.id
      },
      include: {
        WritingTestSubmission: {
          where: {
            studentId: student.userId
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error('Error fetching writing tests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const body = await request.json()
    const { testId, content } = body

    if (!testId || !content) {
      return NextResponse.json({ error: 'Test ID and content are required' }, { status: 400 })
    }

    const test = await prisma.writingTest.findUnique({
      where: { id: testId },
      include: {
        TeacherProfile: {
          include: {
            AssignedSubscriptions: {
              where: {
                studentId: student.userId,
                status: 'APPROVED',
                paid: true
              }
            }
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Writing test not found' }, { status: 404 })
    }

    if (!test.TeacherProfile.AssignedSubscriptions.length) {
      return NextResponse.json({ error: 'You are not enrolled with this teacher' }, { status: 403 })
    }

    const existingSubmission = await prisma.writingTestSubmission.findFirst({
      where: {
        testId,
        studentId: student.userId
      }
    })

    if (existingSubmission) {
      return NextResponse.json({ error: 'You have already submitted this test' }, { status: 400 })
    }

    const submission = await prisma.writingTestSubmission.create({
      data: {
        id: `wsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testId,
        studentId: student.userId,
        content
      },
      include: {
        WritingTest: true
      }
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error submitting writing test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
