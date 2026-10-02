'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Language } from '@/lib/locale'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  language: Language
  toggleTheme: () => void
  toggleLanguage: () => void
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, initialLanguage = 'ar' }: { children: ReactNode; initialLanguage?: Language }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>('light')
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const themePreference = localStorage.getItem('theme')
      const savedTheme: Theme = themePreference === 'dark' ? 'dark' : 'light'
      const cookieLanguage = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('language='))
        ?.split('=')[1]
      const localLanguage = localStorage.getItem('language')
      const savedLanguage: Language = cookieLanguage === 'en' || cookieLanguage === 'ar'
        ? cookieLanguage
        : localLanguage === 'en' || localLanguage === 'ar'
          ? localLanguage
          : 'ar'

      setMounted(true)
      setThemeState(savedTheme)
      setLanguageState(savedLanguage)

      if (savedTheme !== 'light') {
        const html = document.documentElement
        html.classList.remove('light', 'dark')
        html.classList.add(savedTheme)
        html.style.colorScheme = savedTheme
      }

      const html = document.documentElement
      html.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr')
      html.setAttribute('lang', savedLanguage)
      document.cookie = `language=${savedLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
      if (savedLanguage !== initialLanguage) router.refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [initialLanguage, router])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      html.classList.remove('light', 'dark')
      html.classList.add(newTheme)
      html.style.colorScheme = newTheme
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('language', newLanguage)
    
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      html.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr')
      html.setAttribute('lang', newLanguage)
      document.cookie = `language=${newLanguage}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
      router.refresh()
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  const contextValue = {
    theme,
    language,
    toggleTheme,
    toggleLanguage,
    setTheme,
    setLanguage,
    mounted
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
