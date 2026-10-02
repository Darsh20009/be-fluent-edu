'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import BrandLockup from '@/components/brand/BrandLockup'
import LatestCouponPopup from '@/components/LatestCouponPopup'
import { useSession } from 'next-auth/react'
import { localeText } from '@/lib/locale'

const links = [
  { href: '/learning-path', label: 'كيف نبدأ', labelEn: 'How it works' },
  { href: '/about-path', label: 'المسار', labelEn: 'About the path' },
  { href: '/packages', label: 'الباقات', labelEn: 'Plans' },
  { href: '/grammar', label: 'القواعد', labelEn: 'Grammar' },
  { href: '/placement-test', label: 'اختبار المستوى', labelEn: 'Placement test' },
  { href: '/contact', label: 'تواصل معنا', labelEn: 'Contact' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const { language, theme, toggleTheme, toggleLanguage } = useTheme()
  const { status } = useSession()
  const isArabic = language === 'ar'
  const isDark = theme === 'dark'
  const tr = (arabic: string, english: string) => localeText(language, arabic, english)
  const accountHref = status === 'authenticated' ? '/dashboard' : '/auth/login'
  const accountLabel = status === 'authenticated' ? tr('لوحة التحكم', 'Dashboard') : tr('دخول', 'Login')
  return <header dir={isArabic ? 'rtl' : 'ltr'} className={`border-b ${isDark ? 'border-[#344239] bg-[#19231d] text-[#e8efe9]' : 'border-[#dfe5dd] bg-[#fdfcf8] text-[#1e2b29]'}`}>
    <div className="mx-auto flex h-[70px] max-w-[1130px] items-center justify-between px-5">
      <Link href="/" className="shrink-0" aria-label="Be Fluent">
        <BrandLockup size="sm" priority />
      </Link>
      <nav className="hidden items-center gap-5 text-[11px] font-bold text-[#52615b] lg:flex">
        {links.map((link) => <Link key={link.href} href={link.href} className="transition-colors hover:text-[#147050]">{isArabic ? link.label : link.labelEn}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 lg:flex">
        <button type="button" onClick={toggleTheme} aria-label={isArabic ? (isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن') : (isDark ? 'Switch to light mode' : 'Switch to dark mode')} className={`grid min-h-10 min-w-10 place-items-center rounded-lg ${isDark ? 'bg-[#26332e] text-[#eff1e9] hover:bg-[#334239]' : 'bg-[#edf1eb] text-[#435148] hover:bg-[#e4ebe3]'}`}>
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <button onClick={toggleLanguage} aria-label={tr('عرض الموقع بالإنجليزية', 'View the site in Arabic')} className="px-2 text-[10px] font-bold text-[#64716c]">{isArabic ? 'EN' : 'عربي'}</button>
        <Link href={accountHref} className="border border-[#cfd8d1] px-4 py-2 text-[11px] font-bold transition hover:border-[#147050]">{accountLabel}</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-2 text-[11px] font-bold text-[#fffef9] transition hover:bg-[#0e5940]">{isArabic ? 'ابدأ معنا' : 'Get started'}</Link>
      </div>
      <div className="flex items-center gap-1 lg:hidden">
        <button type="button" onClick={toggleTheme} aria-label={isArabic ? (isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن') : (isDark ? 'Switch to light mode' : 'Switch to dark mode')} className="grid h-10 w-10 place-items-center rounded-lg">
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <button onClick={() => setOpen(!open)} aria-label={tr('القائمة', 'Menu')} className="p-2">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
    </div>
    {open && <div className={`border-t px-5 py-4 lg:hidden ${isDark ? 'border-[#344239] bg-[#19231d]' : 'border-[#dfe5dd] bg-[#fdfcf8]'}`}>
      <nav className="mx-auto flex max-w-[1130px] flex-col gap-3 text-sm font-bold">
        <button onClick={toggleLanguage} className="text-start font-bold">{isArabic ? 'English' : 'العربية'}</button>
        {links.map((link) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href}>{isArabic ? link.label : link.labelEn}</Link>)}
        <Link href={accountHref} onClick={() => setOpen(false)}>{accountLabel}</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-3 text-center text-white">{isArabic ? 'ابدأ معنا' : 'Get started'}</Link>
      </nav>
    </div>}
  </header>
}

export function MarketingFooter() {
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const tr = (arabic: string, english: string) => localeText(language, arabic, english)
  return <footer dir={isArabic ? 'rtl' : 'ltr'} className="bg-[#152b27] text-[#eff1e9]">
    <div className="mx-auto max-w-[1130px] px-6 py-12">
      <div className="grid gap-8 border-b border-white/15 pb-9 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><BrandLockup size="md" tone="light" tagline={tr('الطلاقة أولاً', 'FLUENCY COMES FIRST')} className="mb-3" /><p className="max-w-xs text-[10px] leading-6 text-white/65">{tr('تعليم إنجليزي منظم وعملي، مبني حول ما تحتاج أن تقوله في حياتك بالفعل.', 'Structured, practical English learning built around what you need to say in real life.')}</p></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">{tr('استكشف', 'Explore')}</p><div className="flex flex-col gap-2 text-[11px] text-white/75"><Link href="/about-path">{tr('عن المنهج', 'About the approach')}</Link><Link href="/learning-path">{tr('مسار التعلم', 'Learning path')}</Link><Link href="/packages">{tr('الباقات', 'Packages')}</Link><Link href="/grammar">{tr('القواعد', 'Grammar')}</Link><Link href="/placement-test">{tr('اختبار المستوى', 'Placement test')}</Link></div></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">{tr('تواصل', 'Contact')}</p><p className="text-[11px] text-white/75">support@befluent-edu.online</p><p dir="ltr" className="mt-2 text-[11px] text-white/75">+20 109 151 5594</p></div>
      </div>
      <div className="flex flex-col justify-between gap-2 pt-5 text-[9px] text-white/45 md:flex-row"><span>{tr('الطلاقة أولاً', 'FLUENCY COMES FIRST')}</span><span>© {new Date().getFullYear()} Be Fluent Academy</span></div>
      <div className="mt-5 border-t border-white/10 pt-4 text-center text-[10px] text-white/65">
        <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-bold text-white transition hover:text-[#75c7a1]" aria-label="Made by Qirox Studio Group">
          <Image src="/qirox-studio-logo.png" alt="" aria-hidden="true" width={28} height={28} className="h-7 w-7 object-contain" />
          <span dir="ltr">Made by Qirox Studio Group</span>
        </a>
      </div>
    </div>
  </footer>
}

export function MarketingFrame({ children }: { children: ReactNode }) {
  const { language, theme } = useTheme()
  const isDark = theme === 'dark'
  return <main dir={language === 'ar' ? 'rtl' : 'ltr'} className={`bf-marketing min-h-[100dvh] font-sans ${isDark ? 'bg-[#111915] text-[#e8efe9]' : 'bg-[#fdfcf8] text-[#1e2b29]'}`}><MarketingHeader /><LatestCouponPopup />{children}<MarketingFooter /></main>
}