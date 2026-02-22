import { NextRequest, NextResponse } from 'next/server'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { addXP, updateStreak, XP_REWARDS } from '@/lib/gamification'

export async function GET(request: NextRequest) {
  try {
    const student = await requireStudent()
    if (isNextResponse(student)) return student

    // Find which teachers this student is assigned to
    const subscriptions = await prisma.subscription.findMany({
      where: { studentId: student.userId },
      select: { assignedTeacherId: true }
    })
    const teacherIds = subscriptions
      .map(s => s.assignedTeacherId)
      .filter(Boolean) as string[]

    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          // Assignments in sessions where the student is enrolled
          { Session: { SessionStudent: { some: { studentId: student.userId } } } },
          // Admin session assignments (visible to all)
          { Session: { teacherId: 'admin' } },
          // Directly assigned to this student (by studentId on assignment)
          { studentId: student.userId },
          // Assignments from teachers assigned to this student (no session = for all their students)
          ...(teacherIds.length > 0 ? [{
            teacherId: { in: teacherIds },
            sessionId: null
          }] : [])
        ]
      },
      include: {
        Session: {
          select: { id: true, title: true, teacherId: true }
        },
        Submission: {
          where: { studentId: student.userId },
          select: {
            id: true,
            textAnswer: true,
            selectedOption: true,
            attachedFiles: true,
            grade: true,
            feedback: true,
            grammarErrors: true,
            submittedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformed = assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      dueDate: a.dueDate,
      attachmentUrls: a.attachmentUrls,
      multipleChoice: a.multipleChoice,
      session: a.Session ? { title: a.Session.title } : null,
      submissions: a.Submission.map((s: any) => ({ ...s }))
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

    // Verify the assignment exists and student has access
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        Session: {
          include: {
            SessionStudent: { where: { studentId: student.userId } }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check access
    const hasAccess =
      (assignment as any).studentId === student.userId ||
      (assignment.Session && (
        assignment.Session.teacherId === 'admin' ||
        assignment.Session.SessionStudent.length > 0
      )) ||
      assignment.sessionId === null // Teacher broadcast assignment

    if (!hasAccess) {
      return NextResponse.json({ error: 'Assignment not assigned to you' }, { status: 403 })
    }

    // Check for existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: { assignmentId, studentId: student.userId }
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

    const submission = await prisma.submission.create({ data: submissionData })

    await addXP(student.userId, XP_REWARDS.HOMEWORK_SUBMITTED, 'تقديم واجب', 'other')
    await updateStreak(student.userId)

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
