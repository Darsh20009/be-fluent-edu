import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.sessionStudent.findMany({
      where: {
        studentId: session.user.id
      },
      include: {
        Session: {
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
        }
      },
      orderBy: {
        Session: {
          startTime: 'desc'
        }
      }
    })

    const formattedSessions = sessions.map(ss => ({
      id: ss.id,
      sessionId: ss.Session.id,
      attended: ss.attended,
      session: {
        id: ss.Session.id,
        title: ss.Session.title,
        startTime: ss.Session.startTime,
        endTime: ss.Session.endTime,
        status: ss.Session.status,
        roomId: ss.Session.roomId,
        externalLink: ss.Session.externalLink,
        externalLinkType: ss.Session.externalLinkType,
        teacher: {
          user: {
            name: ss.Session.TeacherProfile.User.name
          }
        }
      }
    }))

    return NextResponse.json(formattedSessions)
  } catch (error) {
    console.error('Error fetching student sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
