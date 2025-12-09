import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow in development
    const isDev = process.env.NODE_ENV !== 'production'
    if (!isDev) {
      return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
    }

    // Delete in order of dependencies
    console.log('🧹 Starting data cleanup...')

    const results = {
      sessionStudents: await prisma.sessionStudent.deleteMany({}).then(r => r.count),
      sessions: await prisma.session.deleteMany({}).then(r => r.count),
      assignments: await prisma.assignment.deleteMany({}).then(r => r.count),
      submissions: await prisma.submission.deleteMany({}).then(r => r.count),
      writingTestSubmissions: await prisma.writingTestSubmission.deleteMany({}).then(r => r.count),
      writingTests: await prisma.writingTest.deleteMany({}).then(r => r.count),
      freeWritings: await prisma.freeWriting.deleteMany({}).then(r => r.count),
      words: await prisma.word.deleteMany({}).then(r => r.count),
      chats: await prisma.chat.deleteMany({}).then(r => r.count),
      subscriptions: await prisma.subscription.deleteMany({}).then(r => r.count),
      cartItems: await prisma.cartItem.deleteMany({}).then(r => r.count),
      carts: await prisma.cart.deleteMany({}).then(r => r.count),
      studentProfiles: await prisma.studentProfile.deleteMany({}).then(r => r.count),
      teacherProfiles: await prisma.teacherProfile.deleteMany({}).then(r => r.count),
      users: await prisma.user.deleteMany({}).then(r => r.count),
    }

    console.log('✅ Data cleanup complete:', results)
    return NextResponse.json({ 
      success: true, 
      message: 'All test data cleared',
      results
    })
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
