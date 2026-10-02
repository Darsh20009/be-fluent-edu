import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminAssistant from '@/components/admin/AdminAssistant'

export const dynamic = 'force-dynamic'

export default async function AdminAssistantPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  return <AdminAssistant />
}