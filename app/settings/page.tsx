'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { Settings, Sun, Moon, Globe, Palette, ArrowRight, Languages } from 'lucide-react'
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
    <div className="min-h-[100dvh] bg-[#f4f1e8] p-4 md:p-8 text-[#19372d]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="max-w-3xl mx-auto">
      <div className="mb-8 border-b border-[#d6d2c3] pb-6">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-[#19372d] hover:bg-[#e8eee7] p-2 rounded-none"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="bg-[#174c3c] p-3">
            <Settings className="h-6 w-6 text-[#f7f5ed]" />
          </div>
          <div>
            <p className="text-[10px] tracking-[.18em] uppercase text-[#718075] mb-1">Be Fluent / preferences</p>
            <h1 className="text-3xl font-bold">{text.title}</h1>
            <p className="text-[#69756c] text-sm">{text.subtitle}</p>
          </div>
        </div>
      </div>

      {saved && (
        <Alert variant="success" dismissible onDismiss={() => setSaved(false)} className="mb-6">
          {text.savedMessage}
        </Alert>
      )}

      {/* Theme Settings */}
      <Card variant="elevated" padding="lg" className="mb-5 bg-[#fbfaf5] border border-[#d6d2c3] shadow-none rounded-none">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-5 w-5 text-[#174c3c]" />
          <div>
            <h2 className="text-xl font-bold">{text.themeSection}</h2>
            <p className="text-sm text-[#69756c]">{text.themeDesc}</p>
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
                ? 'bg-[#174c3c] border-[#174c3c] text-[#f7f5ed]'
                : 'bg-[#f7f5ed] border-[#d6d2c3] text-[#19372d] hover:border-[#74927a]'
            }`}
          >
            <Sun className={`h-10 w-10 mx-auto mb-3 ${theme === 'light' ? 'text-[#f7f5ed]' : 'text-[#174c3c]'}`} />
            <div className="text-xl font-bold">{text.lightMode}</div>
          </button>

          <button
            onClick={() => {
              setTheme('dark')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'bg-[#174c3c] border-[#174c3c] text-[#f7f5ed]'
                : 'bg-[#f7f5ed] border-[#d6d2c3] text-[#19372d] hover:border-[#74927a]'
            }`}
          >
            <Moon className={`h-10 w-10 mx-auto mb-3 ${theme === 'light' ? 'text-[#f7f5ed]' : 'text-[#174c3c]'}`} />
            <div className="text-xl font-bold">{text.darkMode}</div>
          </button>
        </div>
      </Card>

      {/* Language Settings */}
      <Card variant="elevated" padding="lg" className="mb-5 bg-[#fbfaf5] border border-[#d6d2c3] shadow-none rounded-none">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-5 w-5 text-[#174c3c]" />
          <div>
            <h2 className="text-xl font-bold">{text.languageSection}</h2>
            <p className="text-sm text-[#69756c]">{text.languageDesc}</p>
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
                ? 'bg-[#174c3c] border-[#174c3c] text-[#f7f5ed]'
                : 'bg-[#f7f5ed] border-[#d6d2c3] text-[#19372d] hover:border-[#74927a]'
            }`}
          >
            <Languages className="h-10 w-10 mx-auto mb-3" />
            <div className="text-xl font-bold">{text.arabic}</div>
          </button>

          <button
            onClick={() => {
              setLanguage('en')
              handleSave()
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              language === 'en'
                ? 'bg-[#174c3c] border-[#174c3c] text-[#f7f5ed]'
                : 'bg-[#f7f5ed] border-[#d6d2c3] text-[#19372d] hover:border-[#74927a]'
            }`}
          >
            <Languages className="h-10 w-10 mx-auto mb-3" />
            <div className="text-xl font-bold">{text.english}</div>
          </button>
        </div>
      </Card>

      {/* Preview Section */}
      <Card variant="elevated" padding="lg" className="bg-[#fbfaf5] border border-[#d6d2c3] shadow-none rounded-none">
        <h3 className="text-xl font-bold mb-4">
          {language === 'ar' ? 'معاينة' : 'Preview'}
        </h3>
        <div className="bg-[#edf1e9] p-6 border border-[#c8d3c7]">
          <p className="text-[#19372d] text-lg mb-2">
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

      <footer className="mt-8 text-center text-xs text-[#718075] pb-4">
        Be Fluent Academy · English made present
      </footer>
      </div>
    </div>
  )
}