import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if teacher profile exists
    let teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    // If not, create it
    if (!teacherProfile) {
      teacherProfile = await prisma.teacherProfile.create({
        data: {
          userId: session.user.id,
          bio: '',
          subjects: ''
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      teacherProfileId: teacherProfile.id,
      message: 'Teacher profile ready'
    })
  } catch (error) {
    console.error('Error setting up teacher profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
