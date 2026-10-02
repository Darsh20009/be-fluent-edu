'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BFAuthModal from '@/components/auth/BFAuthModal'

function safeReturnTo(callbackUrl: string | null) {
  if (!callbackUrl) return '/dashboard'
  try {
    const destination = new URL(callbackUrl, 'https://befluent.invalid')
    const isSafePath = destination.pathname === '/onboarding'
      || destination.pathname === '/dashboard'
      || destination.pathname.startsWith('/dashboard/')
    if (destination.origin === 'https://befluent.invalid' && isSafePath) {
      return `${destination.pathname}${destination.search}${destination.hash}`
    }
  } catch {
    // Malformed or external callback URLs use the dashboard default.
  }
  return '/dashboard'
}

export default function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const embedded = searchParams.get('embedded') === 'true'
  const [open, setOpen] = useState(true)
  const onClose = useCallback(() => {
    if (embedded) return
    setOpen(false)
    router.push('/')
  }, [embedded, router])
  const onComplete = useCallback((destination: string) => {
    setOpen(false)
    router.push(destination)
    router.refresh()
  }, [router])

  return (
    <BFAuthModal
      open={open}
      entryMode="login"
      returnTo={safeReturnTo(searchParams.get('callbackUrl'))}
      registrationHref="/auth/register"
      embedded={embedded}
      onClose={onClose}
      onComplete={onComplete}
    />
  )
}