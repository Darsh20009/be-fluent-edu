import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionClient from './SessionClient'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  return (
    <SessionClient
      sessionId={id}
      user={session?.user as any || null}
      isAuthenticated={!!session}
    />
  )
}
