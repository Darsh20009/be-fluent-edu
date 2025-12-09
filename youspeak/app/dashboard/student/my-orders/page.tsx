import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import MyOrdersClient from './MyOrdersClient'

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  return <MyOrdersClient />
}
