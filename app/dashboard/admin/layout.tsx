import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminDashboardClient from './AdminDashboardClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (!['ADMIN', 'ASSISTANT', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }
  const language = await getServerLanguage()

  return (
    <div dir={localeDirection(language)}>
    <AdminDashboardClient
      user={{
        name: session.user.name || 'Be Fluent',
        email: session.user.email || '',
        role: session.user.role,
      }}
    >
      {children}
    </AdminDashboardClient>
    </div>
  )
}