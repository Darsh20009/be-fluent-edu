'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, language, toggleTheme } = useTheme()
  const isArabic = language === 'ar'
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid min-h-10 min-w-10 place-items-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      aria-label={isArabic ? (theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن') : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')}
      title={isArabic ? (theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن') : (theme === 'dark' ? 'Light mode' : 'Dark mode')}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  )
}
