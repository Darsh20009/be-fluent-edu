import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TeacherDashboardClient from './TeacherDashboardClient'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  let teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id }
  })

  // Auto-create if doesn't exist
  if (!teacherProfile) {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: session.user.id,
        bio: '',
        subjects: ''
      }
    })
  }

  return (
    <TeacherDashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        teacherProfileId: teacherProfile.id
      }}
    />
  )
}
