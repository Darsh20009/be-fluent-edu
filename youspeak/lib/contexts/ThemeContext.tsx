'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'
type Language = 'ar' | 'en'

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setThemeState] = useState<Theme>('light')
  const [language, setLanguageState] = useState<Language>('ar')

  useEffect(() => {
    // Load from localStorage
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light'
    const savedLanguage = (localStorage.getItem('language') as Language) || 'ar'
    
    setThemeState(savedTheme)
    setLanguageState(savedLanguage)
    
    // Apply to document
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(savedTheme)
    html.style.colorScheme = savedTheme
    html.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr')
    html.setAttribute('lang', savedLanguage)
    
    setMounted(true)
  }, [])

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
