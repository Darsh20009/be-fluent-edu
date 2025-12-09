import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const role = session.user.role

  if (role === 'STUDENT') {
    redirect('/dashboard/student')
  } else if (role === 'TEACHER') {
    redirect('/dashboard/teacher')
  } else if (role === 'ADMIN' || role === 'ASSISTANT') {
    redirect('/dashboard/admin')
  }

  return null
}
