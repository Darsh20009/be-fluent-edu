import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, preferredDays, lessonsPerWeek } = await request.json()

    if (!subscriptionId || !preferredDays || !lessonsPerWeek) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate preferredDays is array of day numbers (0-6, 0=Sunday)
    if (!Array.isArray(preferredDays) || !preferredDays.every(d => typeof d === 'number' && d >= 0 && d <= 6)) {
      return NextResponse.json({ error: 'Invalid days format' }, { status: 400 })
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { Package: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.studentId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (subscription.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Subscription not approved' }, { status: 400 })
    }

    // Update subscription with preferences (when schema is synced)
    try {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          preferredDays: JSON.stringify(preferredDays),
          lessonsPerWeek: lessonsPerWeek
        }
      })
    } catch {
      // Schema sync might be pending, continue with session creation
      console.log('Note: Run npx prisma db push to sync schema changes')
    }

    // Generate sessions for the subscription duration
    const startDate = subscription.startDate || new Date()
    const endDate = subscription.endDate || new Date()
    const sessions = generateSessions(startDate, endDate, preferredDays, lessonsPerWeek, subscription.assignedTeacherId!)

    // Create sessions in database
    for (const sessionData of sessions) {
      await prisma.session.create({
        data: {
          teacherId: subscription.assignedTeacherId!,
          title: `English Lesson - دراسة اللغة الإنجليزية`,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          status: 'SCHEDULED'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `${sessions.length} sessions scheduled successfully`,
      sessionsCount: sessions.length
    })
  } catch (error) {
    console.error('Error scheduling sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateSessions(
  startDate: Date,
  endDate: Date,
  preferredDays: number[],
  lessonsPerWeek: number,
  teacherId: string
) {
  const sessions = []
  const current = new Date(startDate)
  
  // Adjust to first preferred day
  while (!preferredDays.includes(current.getDay())) {
    current.setDate(current.getDate() + 1)
  }

  let weekSessionCount = 0
  let weekStartDay = new Date(current)
  weekStartDay.setDate(weekStartDay.getDate() - weekStartDay.getDay())

  while (current <= endDate) {
    // Check if we've moved to a new week
    const currentWeekStart = new Date(current)
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())

    if (currentWeekStart.getTime() !== weekStartDay.getTime()) {
      weekStartDay = currentWeekStart
      weekSessionCount = 0
    }

    // Create session if we haven't reached the limit for this week
    if (weekSessionCount < lessonsPerWeek && preferredDays.includes(current.getDay())) {
      const startTime = new Date(current)
      startTime.setHours(15, 0, 0, 0) // 3:00 PM

      const endTime = new Date(current)
      endTime.setHours(16, 0, 0, 0) // 4:00 PM

      sessions.push({
        teacherId,
        startTime,
        endTime
      })

      weekSessionCount++
    }

    current.setDate(current.getDate() + 1)
  }

  return sessions
}
