import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeacher, parseJsonBody, isNextResponse } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params

    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        Session: {
          teacherId: teacher.teacherProfileId
        }
      },
      include: {
        Session: true,
        Submission: {
          include: {
            User: true
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params

    const body = await parseJsonBody<{
      title?: string
      description?: string
      dueDate?: string
      sessionId?: string
    }>(request)
    if (isNextResponse(body)) return body

    const { title, description, dueDate, sessionId } = body

    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id,
        Session: {
          teacherId: teacher.teacherProfileId
        }
      }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      })

      if (!session || session.teacherId !== teacher.teacherProfileId) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (sessionId !== undefined) updateData.sessionId = sessionId
    updateData.updatedAt = new Date()

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        Session: true,
        Submission: {
          include: {
            User: true
          }
        }
      }
    })

    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher()
    if (isNextResponse(teacher)) return teacher

    const { id } = await params

    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        id,
        OR: [
          { Session: { teacherId: teacher.teacherProfileId } },
          { teacherId: teacher.teacherProfileId }
        ]
      }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    await prisma.assignment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
