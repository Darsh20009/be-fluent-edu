import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TeacherRouteLayout from './TeacherRouteLayout'

export const dynamic = 'force-dynamic'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (!['TEACHER', 'ADMIN'].includes(session.user.role)) redirect('/dashboard')

  return (
    <TeacherRouteLayout
      user={{
        name: session.user.name || 'Be Fluent',
        email: session.user.email || '',
        role: session.user.role,
      }}
    >
      {children}
    </TeacherRouteLayout>
  )
}