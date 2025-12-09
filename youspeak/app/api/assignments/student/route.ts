import { NextRequest, NextResponse } from 'next/server'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const assignments = await prisma.assignment.findMany({
      where: {
        Session: {
          SessionStudent: {
            some: { studentId: student.userId }
          }
        }
      },
      include: {
        Session: {
          select: {
            id: true,
            title: true
          }
        },
        Submission: {
          where: { studentId: student.userId },
          select: {
            id: true,
            textAnswer: true,
            grade: true,
            feedback: true,
            grammarErrors: true,
            submittedAt: true
          }
        }
      },
      orderBy: { dueDate: 'desc' }
    })

    // Transform to match frontend interface
    const transformed = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      session: a.Session ? { title: a.Session.title } : null,
      submissions: a.Submission
    }))

    return NextResponse.json(transformed)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    const body = await request.json()
    const { assignmentId, textAnswer, selectedOption, attachedFiles } = body

    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 })
    }

    if (!textAnswer && selectedOption === null && selectedOption === undefined) {
      return NextResponse.json({ error: 'Missing submission data' }, { status: 400 })
    }

    // Verify the student is enrolled in the session that owns this assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        Session: {
          include: {
            SessionStudent: {
              where: { studentId: student.userId }
            }
          }
        }
      }
    })

    if (!assignment || !assignment.Session) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (assignment.Session.SessionStudent.length === 0) {
      return NextResponse.json({ error: 'You are not enrolled in this session' }, { status: 403 })
    }

    // Check if student has already submitted this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: student.userId
      }
    })

    if (existingSubmission) {
      return NextResponse.json({ error: 'You have already submitted this assignment' }, { status: 400 })
    }

    const submissionData: any = {
      assignmentId,
      studentId: student.userId,
      textAnswer: textAnswer || null,
      attachedFiles: attachedFiles || null
    }
    
    if (selectedOption !== undefined && selectedOption !== null) {
      submissionData.selectedOption = selectedOption
    }

    const submission = await prisma.submission.create({
      data: submissionData
    })

    await addXP(student.userId, XP_REWARDS.HOMEWORK_SUBMITTED, 'تقديم واجب', 'other')
    await updateStreak(student.userId)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
