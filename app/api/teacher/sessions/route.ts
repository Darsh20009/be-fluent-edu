import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generate unique room ID compatible with MongoDB
function generateRoomId(): string {
  return crypto.randomBytes(12).toString('hex')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    // Auto-create teacher profile for ADMIN if it doesn't exist
    if (!teacherProfile && session.user.role === 'ADMIN') {
      teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: session.user.id,
          bio: 'Admin Teacher',
          subjects: 'All Subjects'
        }
      })
    }

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const sessions = await prisma.session.findMany({
      where: {
        teacherId: teacherProfile.id
      },
      include: {
        SessionStudent: {
          include: {
            User: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate random 4-digit password
function generateSessionPassword(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    // Auto-create teacher profile for ADMIN if it doesn't exist
    if (!teacherProfile && session.user.role === 'ADMIN') {
      teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: session.user.id,
          bio: 'Admin Teacher',
          subjects: 'All Subjects'
        }
      })
    }

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const { title, startTime, endTime, studentIds } = await request.json()

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate unique roomId and password for this session
    const roomId = generateRoomId()
    const sessionPassword = generateSessionPassword()

    try {
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
      }

      if (startDate >= endDate) {
        return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 })
      }

      const newSession = await prisma.session.create({
        data: {
          teacherId: teacherProfile.id,
          title: String(title).trim(),
          startTime: startDate,
          endTime: endDate,
          status: 'SCHEDULED', // Always start as SCHEDULED
          sessionPassword,
          roomId
        }
      })

      console.log(`✅ Session created: ${newSession.id}`)

      // Add selected students to the session
      if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
        for (const studentId of studentIds) {
          try {
            await prisma.sessionStudent.create({
              data: {
                sessionId: newSession.id,
                studentId
              }
            })
          } catch (err) {
            console.warn(`Could not add student ${studentId} to session:`, err)
          }
        }
      }

      return NextResponse.json(newSession, { status: 201 })
    } catch (error: any) {
      console.error('Error creating session:', error?.message || error)
      return NextResponse.json(
        { error: error?.message || 'Failed to create session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in session creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
