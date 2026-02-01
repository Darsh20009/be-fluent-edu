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
        Session: {
          teacherId: teacherProfile.id
        }
      },
      include: {
        Session: true,
        Submission: {
          include: {
            User: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      })

      if (!session || session.teacherId !== teacherProfile.id) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
      }
    }

    const assignmentData: any = {
      title,
      description: description || null,
      sessionId: sessionId || null,
      dueDate: dueDate ? new Date(dueDate) : null
    }
    
    if (type) {
      assignmentData.type = type
    }
    
    if (attachmentUrls && attachmentUrls.length > 0) {
      assignmentData.attachmentUrls = attachmentUrls[0]
    }
    
    if (multipleChoice) {
      assignmentData.multipleChoice = JSON.stringify(multipleChoice)
    }

    const assignment = await prisma.assignment.create({
      data: {
        ...assignmentData,
        title: title.trim()
      }
    })

    // If no sessionId but studentIds provided, create SessionStudents for each student
    if (!sessionId && studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Create a temporary session to link assignment to students
      const tempSession = await prisma.session.create({
        data: {
          teacherId: teacherProfile.id,
          title: `Auto-Session for ${title}`,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          status: 'SCHEDULED'
        }
      })

      await prisma.assignment.update({
        where: { id: assignment.id },
        data: { sessionId: tempSession.id }
      })

      for (const studentId of studentIds) {
        await prisma.sessionStudent.create({
          data: {
            sessionId: tempSession.id,
            studentId,
            attended: false
          }
        }).catch(() => {
          // Ignore duplicate errors
        })
      }
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
