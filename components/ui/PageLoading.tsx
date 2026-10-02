'use client'

import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

export default function PageLoading({ dashboard = false }: { dashboard?: boolean }) {
  const { language } = useTheme()
  const text = dashboard
    ? localeText(language, 'جارٍ تحميل لوحة التحكم…', 'Loading your dashboard…')
    : localeText(language, 'جارٍ تحميل الصفحة…', 'Loading the page…')
  return (
    <section
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      className="min-h-[60dvh] bg-background px-5 py-12 text-foreground"
      role="status"
      aria-busy="true"
      aria-label={text}
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-sm text-muted">{text}</p>
        <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
          <div className="h-7 w-2/5 rounded-md bg-surface-muted" />
          <div className="h-4 w-3/5 rounded-md bg-surface-muted" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="h-36 rounded-xl border border-border bg-surface" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}