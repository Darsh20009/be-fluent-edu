'use client'

import { Languages } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection } from '@/lib/locale'
import styles from './student-foundation.module.css'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { language, toggleLanguage } = useTheme()
  return (
    <div className={styles.foundation} dir={localeDirection(language)}>
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label={language === 'ar' ? 'Switch language to English' : 'تغيير اللغة إلى العربية'}
        className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-lg ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
      >
        <Languages className="h-5 w-5" aria-hidden="true" />
        <span>{language === 'ar' ? 'English' : 'العربية'}</span>
      </button>
      {children}
    </div>
  )
}