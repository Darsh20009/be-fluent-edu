'use client'

import type { ReactNode } from 'react'
import LanguageToggle from '@/components/LanguageToggle'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection } from '@/lib/locale'

export default function AdminLocaleShell({ children }: { children: ReactNode }) {
  const { language } = useTheme()
  return (
    <div dir={localeDirection(language)} className="min-h-screen">
      <div className="fixed right-4 top-4 z-50">
        <LanguageToggle />
      </div>
      {children}
    </div>
  )
}