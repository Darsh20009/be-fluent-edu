'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import styles from './student-foundation.module.css'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { language } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [gate, setGate] = useState<'checking' | 'ready' | 'error'>('checking')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setGate('checking')
    fetch('/api/student/profile', { cache: 'no-store' })
      .then(async (response) => {
        if (!active) return
        if (response.status === 401) {
          router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
          return
        }
        if (!response.ok) {
          setGate('error')
          return
        }
        const user = await response.json()
        if (!active) return
        const profile = user?.StudentProfile
        const complete = Number.isInteger(profile?.age)
          && profile.age >= 5
          && profile.age <= 100
          && ['FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'].includes(profile?.gender)
          && typeof profile?.nationality === 'string'
          && profile.nationality.trim().length >= 2
        if (!complete) {
          router.replace('/onboarding')
          return
        }
        setGate('ready')
      })
      .catch(() => {
        if (active) setGate('error')
      })
    return () => { active = false }
  }, [pathname, retry, router])

  if (gate !== 'ready') {
    return (
      <main className={styles.foundation} dir={localeDirection(language)}>
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
          {gate === 'checking' ? (
            <>
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#dce4dc] border-t-[#24714f]" aria-hidden="true" />
              <p className="text-sm text-[#526157]">{localeText(language, 'جارٍ التحقق من ملفك…', 'Checking your profile…')}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-[#526157]">{localeText(language, 'تعذر التحقق من ملفك. أعد المحاولة للمتابعة.', 'We could not verify your profile. Retry to continue.')}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-4 min-h-11 bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#1d5f42]"
              >
                {localeText(language, 'إعادة المحاولة', 'Retry')}
              </button>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <div className={styles.foundation} dir={localeDirection(language)}>
      {children}
    </div>
  )
}