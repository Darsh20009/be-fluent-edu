'use client'

import { Languages } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useTheme()
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle language"
    >
      <Languages className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {language === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  )
}
