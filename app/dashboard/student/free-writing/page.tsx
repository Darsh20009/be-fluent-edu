import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import FreeWritingClient from './FreeWritingClient'

export default async function FreeWritingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  return <FreeWritingClient />
}
