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

    const sessionData = await prisma.session.findFirst({
      where: {
        id,
        teacherId: teacher.teacherProfileId
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
        },
        SessionStudent: {
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

    if (!sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...sessionData,
      teacher: {
        name: sessionData.TeacherProfile.User.name
      }
    })
  } catch (error) {
    console.error('Error fetching session:', error)
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
    
    const body = await parseJsonBody<{ title?: string; startTime?: string; endTime?: string; status?: string }>(request)
    if (isNextResponse(body)) return body

    const { title, startTime, endTime, status } = body

    const existingSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (existingSession.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = String(title).trim()
    if (startTime !== undefined) {
      const newStartTime = new Date(startTime)
      if (isNaN(newStartTime.getTime())) {
        return NextResponse.json({ error: 'Invalid start time format' }, { status: 400 })
      }
      updateData.startTime = newStartTime
    }
    if (endTime !== undefined) {
      const newEndTime = new Date(endTime)
      if (isNaN(newEndTime.getTime())) {
        return NextResponse.json({ error: 'Invalid end time format' }, { status: 400 })
      }
      updateData.endTime = newEndTime
    }
    if (status !== undefined) updateData.status = String(status).trim()
    updateData.updatedAt = new Date()

    // Validate start time is before end time if both provided
    if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        SessionStudent: {
          include: {
            User: true
          }
        }
      }
    })

    console.log(`✅ Session updated: ${id}`)

    return NextResponse.json({
      ...updatedSession,
      sessionPassword: updatedSession.sessionPassword
    })
  } catch (error: any) {
    console.error('Error updating session:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update session' },
      { status: 500 }
    )
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

    const existingSession = await prisma.session.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (existingSession.teacherId !== teacher.teacherProfileId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.session.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
