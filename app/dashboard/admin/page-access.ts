import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requireAdminPageAccess() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (session.user.role !== 'ADMIN' && session.user.role !== 'ASSISTANT') {
    redirect('/dashboard')
  }
  return session
}