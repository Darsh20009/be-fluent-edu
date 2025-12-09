import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import StudentDashboardClient from './StudentDashboardClient'

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  return (
    <StudentDashboardClient
      user={{
        name: session.user.name,
        email: session.user.email,
        isActive: session.user.isActive,
      }}
    />
  )
}
