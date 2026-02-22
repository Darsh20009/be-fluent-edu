import { NextRequest, NextResponse } from 'next/server'
import { requireTeacher, isNextResponse } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id: teacher.teacherProfileId }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        OR: [
          { Session: { teacherId: teacherProfile.id } },
          { teacherId: teacherProfile.id }
        ]
      },
      include: {
        Session: true,
        Submission: {
          include: { User: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { id: teacher.teacherProfileId }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const { title, description, type, sessionId, dueDate, studentIds, attachmentUrls, multipleChoice } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (sessionId) {
      const session = await prisma.session.findUnique({ where: { id: sessionId } })
      if (!session || session.teacherId !== teacherProfile.id) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
      }
    }

    const assignmentData: any = {
      title: title.trim(),
      description: description || null,
      sessionId: sessionId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      teacherId: teacherProfile.id,
      type: type || 'TEXT'
    }

    // Store ALL attachment URLs as JSON array
    if (attachmentUrls && attachmentUrls.length > 0) {
      assignmentData.attachmentUrls = JSON.stringify(attachmentUrls)
    }

    if (multipleChoice) {
      assignmentData.multipleChoice = JSON.stringify(multipleChoice)
    }

    const assignment = await prisma.assignment.create({ data: assignmentData })

    const hasStudents = studentIds && Array.isArray(studentIds) && studentIds.length > 0

    if (!sessionId && hasStudents) {
      // Create a hidden session to link specific students to this assignment
      const tempSession = await prisma.session.create({
        data: {
          teacherId: teacherProfile.id,
          title: `[واجب] ${title.trim()}`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          status: 'SCHEDULED'
        }
      })

      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { sessionId: tempSession.id }
      })

      // Add each student to the session
      for (const sid of studentIds) {
        await prisma.sessionStudent.upsert({
          where: { sessionId_studentId: { sessionId: tempSession.id, studentId: sid } },
          update: {},
          create: { sessionId: tempSession.id, studentId: sid, attended: false }
        })
      }
    } else if (sessionId && hasStudents) {
      // Also add any extra students directly to the chosen session
      for (const sid of studentIds) {
        await prisma.sessionStudent.upsert({
          where: { sessionId_studentId: { sessionId, studentId: sid } },
          update: {},
          create: { sessionId, studentId: sid, attended: false }
        })
      }
    }

    // Send email notifications
    try {
      const { sendEmail, getAssignmentEmailTemplate } = await import('@/lib/email')
      const dueDateStr = dueDate ? new Date(dueDate).toLocaleString('ar-EG') : 'غير محدد'

      if (hasStudents) {
        const studentDetails = await prisma.user.findMany({
          where: { id: { in: studentIds } },
          select: { email: true, name: true }
        })
        await Promise.all(studentDetails.map(student =>
          sendEmail({
            to: student.email,
            subject: `واجب جديد: ${title}`,
            html: getAssignmentEmailTemplate(student.name, title, dueDateStr)
          })
        ))
      } else if (sessionId) {
        const sessionStudents = await prisma.sessionStudent.findMany({
          where: { sessionId },
          include: { User: true }
        })
        await Promise.all(sessionStudents.map(ss =>
          sendEmail({
            to: ss.User.email,
            subject: `واجب جديد: ${title}`,
            html: getAssignmentEmailTemplate(ss.User.name, title, dueDateStr)
          })
        ))
      }
    } catch (emailError) {
      console.error('Failed to send assignment emails:', emailError)
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
