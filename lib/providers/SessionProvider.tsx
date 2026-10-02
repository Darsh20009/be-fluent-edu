'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchInterval={24 * 60 * 60} refetchOnWindowFocus>
      {children}
    </NextAuthSessionProvider>
  )
}
