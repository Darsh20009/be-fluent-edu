'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import BFAuthModal from './BFAuthModal'

type EntryMode = 'login' | 'start'

export default function BFAuthExperience() {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  const [open, setOpen] = useState(false)
  const [entryMode, setEntryMode] = useState<EntryMode>('login')
  const [returnTo, setReturnTo] = useState('/dashboard')
  const [registrationHref, setRegistrationHref] = useState('/auth/register')
  const triggerRef = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (pathname.startsWith('/auth/')) return

    const handleSiteAuthLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.hasAttribute('data-bf-auth-bypass') || anchor.target === '_blank') return

      let destination: URL
      try {
        destination = new URL(anchor.href, window.location.href)
      } catch {
        return
      }

      if (destination.origin !== window.location.origin) return
      const isAuthEntry = destination.pathname === '/auth/login' || destination.pathname === '/auth/register'
      const isDashboardDestination = destination.pathname === '/dashboard' || destination.pathname.startsWith('/dashboard/')
      if (!isAuthEntry && !(isDashboardDestination && status === 'unauthenticated')) return

      if (isAuthEntry && status === 'authenticated') {
        event.preventDefault()
        router.push('/dashboard')
        return
      }

      event.preventDefault()
      triggerRef.current = anchor
      setEntryMode(destination.pathname === '/auth/register' ? 'start' : 'login')
      setRegistrationHref(destination.pathname === '/auth/register'
        ? `${destination.pathname}${destination.search}`
        : '/auth/register')
      let nextPath = isDashboardDestination
        ? `${destination.pathname}${destination.search}${destination.hash}`
        : '/dashboard'
      const callbackUrl = destination.searchParams.get('callbackUrl')
      if (isAuthEntry && callbackUrl) {
        try {
          const callback = new URL(callbackUrl, destination.origin)
          const isSafeDashboardPath = callback.pathname === '/dashboard' || callback.pathname.startsWith('/dashboard/')
          if (callback.origin === destination.origin && isSafeDashboardPath) {
            nextPath = `${callback.pathname}${callback.search}${callback.hash}`
          }
        } catch {
          // Keep the safe dashboard default for malformed callback URLs.
        }
      }
      setReturnTo(nextPath)
      setOpen(true)
    }

    document.addEventListener('click', handleSiteAuthLink, true)
    return () => document.removeEventListener('click', handleSiteAuthLink, true)
  }, [pathname, router, status])

  return (
    <BFAuthModal
      open={open}
      entryMode={entryMode}
      returnTo={returnTo}
      registrationHref={registrationHref}
      onClose={close}
    />
  )
}