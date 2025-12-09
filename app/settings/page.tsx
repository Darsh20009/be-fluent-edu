'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { Settings, Sun, Moon, Globe, Palette, Save, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const { theme, language, setTheme, setLanguage } = useTheme()
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  useEffect(() => {
    if (saved) {
      console.log('Settings saved:', { theme, language })
    }
  }, [saved, theme, language])

  const t = {
    ar: {
      title: 'الإعدادات',
      subtitle: 'Settings',
      themeSection: 'المظهر',
      themeDesc: 'Theme',
      lightMode: 'الوضع الفاتح',
      darkMode: 'الوضع الداكن',
      languageSection: 'اللغة',
      languageDesc: 'Language',
      arabic: 'العربية',
      english: 'English',
      saveButton: 'حفظ التغييرات',
      savedMessage: 'تم حفظ الإعدادات بنجاح!'
    },
    en: {
      title: 'Settings',
      subtitle: 'الإعدادات',
      themeSection: 'Appearance',
      themeDesc: 'المظهر',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode',
      languageSection: 'Language',
      languageDesc: 'اللغة',
      arabic: 'العربية',
      english: 'English',
      saveButton: 'Save Changes',
      savedMessage: 'Settings saved successfully!'
    }
  }

  const text = t[language] || t['ar']

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowRight className="h-8 w-8 text-black" />
          </Button>
          <div className="bg-[#004E89] p-3 rounded-xl">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black">{text.title}</h1>
            <p className="text-black opacity-70">{text.subtitle}</p>
          </div>
        </div>
      </div>

      {saved && (
        <Alert variant="success" dismissible onDismiss={() => setSaved(false)} className="mb-6">
          {text.savedMessage}
        </Alert>
      )}

      {/* Theme Settings */}
      <Card variant="elevated" padding="lg" className="mb-6 bg-[var(--card-bg)] border-2 border-[var(--border)]">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{text.themeSection}</h2>
            <p className="text-sm text-[var(--foreground)] opacity-70">{text.themeDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setTheme('light')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-600'
            }`}
          >
            <Sun className={`h-12 w-12 mx-auto mb-3 ${theme === 'light' ? 'text-white' : 'text-blue-600'}`} />
            <div className="text-xl font-bold">{text.lightMode}</div>
          </button>

          <button
            onClick={() => {
              setTheme('dark')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-600'
            }`}
          >
            <Moon className={`h-12 w-12 mx-auto mb-3 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
            <div className="text-xl font-bold">{text.darkMode}</div>
          </button>
        </div>
      </Card>

      {/* Language Settings */}
      <Card variant="elevated" padding="lg" className="mb-6 bg-[var(--card-bg)] border-2 border-[var(--border)]">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">{text.languageSection}</h2>
            <p className="text-sm text-[var(--foreground)] opacity-70">{text.languageDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setLanguage('ar')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              language === 'ar'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-600'
            }`}
          >
            <div className="text-6xl mb-3">🇸🇦</div>
            <div className="text-xl font-bold">{text.arabic}</div>
          </button>

          <button
            onClick={() => {
              setLanguage('en')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              language === 'en'
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--foreground)] hover:border-blue-600'
            }`}
          >
            <div className="text-6xl mb-3">🇬🇧</div>
            <div className="text-xl font-bold">{text.english}</div>
          </button>
        </div>
      </Card>

      {/* Preview Section */}
      <Card variant="elevated" padding="lg" className="bg-[var(--card-bg)] border-2 border-[var(--border)]">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
          {language === 'ar' ? 'معاينة' : 'Preview'}
        </h3>
        <div className="bg-[var(--background)] p-6 rounded-xl border-2 border-[var(--border)]">
          <p className="text-[var(--foreground)] text-lg mb-2">
            {language === 'ar'
              ? 'هذا مثال على كيفية ظهور النصوص في الموقع'
              : 'This is an example of how text will appear on the site'}
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="primary" size="sm">
              {language === 'ar' ? 'زر أساسي' : 'Primary Button'}
            </Button>
            <Button variant="secondary" size="sm">
              {language === 'ar' ? 'زر ثانوي' : 'Secondary Button'}
            </Button>
          </div>
        </div>
      </Card>

      <footer className="mt-8 text-center text-sm text-black pb-4">
        Made with ❤️ by MA3K Company
      </footer>
    </div>
  )
}