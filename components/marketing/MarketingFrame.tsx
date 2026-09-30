'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import BrandLockup from '@/components/brand/BrandLockup'

const links = [
  { href: '/learning-path', label: 'كيف نبدأ' },
  { href: '/about-path', label: 'المسار' },
  { href: '/packages', label: 'الباقات' },
  { href: '/grammar', label: 'القواعد' },
  { href: '/contact', label: 'تواصل معنا' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  const { language, toggleLanguage } = useTheme()
  const isArabic = language === 'ar'
  return <header dir={isArabic ? 'rtl' : 'ltr'} className="border-b border-[#dfe5dd] bg-[#fdfcf8] text-[#1e2b29]">
    <div className="mx-auto flex h-[70px] max-w-[1130px] items-center justify-between px-5">
      <Link href="/" className="shrink-0" aria-label="Be Fluent">
        <BrandLockup size="sm" priority />
      </Link>
      <nav className="hidden items-center gap-6 text-[11px] font-bold text-[#52615b] md:flex">
        {links.map((link, index) => <Link key={link.href} href={link.href} className="transition-colors hover:text-[#147050]">{isArabic ? link.label : ['How it works','Learning path','Plans','Grammar','Contact'][index]}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <button onClick={toggleLanguage} className="px-2 text-[10px] font-bold text-[#64716c]">{isArabic ? 'EN' : 'عربي'}</button>
        <Link href="/auth/login" className="border border-[#cfd8d1] px-4 py-2 text-[11px] font-bold transition hover:border-[#147050]">{isArabic ? 'دخول' : 'Login'}</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-2 text-[11px] font-bold text-[#fffef9] transition hover:bg-[#0e5940]">{isArabic ? 'ابدأ معنا' : 'Get started'}</Link>
      </div>
      <button onClick={() => setOpen(!open)} aria-label="القائمة" className="p-2 md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
    </div>
    {open && <div className="border-t border-[#dfe5dd] px-5 py-4 md:hidden">
      <nav className="mx-auto flex max-w-[1130px] flex-col gap-3 text-sm font-bold">
        <button onClick={toggleLanguage} className="text-start font-bold">{isArabic ? 'English' : 'العربية'}</button>
        {links.map((link, index) => <Link onClick={() => setOpen(false)} key={link.href} href={link.href}>{isArabic ? link.label : ['How it works','Learning path','Plans','Grammar','Contact'][index]}</Link>)}
        <Link href="/auth/login">{isArabic ? 'دخول' : 'Login'}</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-3 text-center text-white">{isArabic ? 'ابدأ معنا' : 'Get started'}</Link>
      </nav>
    </div>}
  </header>
}

export function MarketingFooter() {
  const { language } = useTheme()
  const isArabic = language === 'ar'
  return <footer dir={isArabic ? 'rtl' : 'ltr'} className="bg-[#152b27] text-[#eff1e9]">
    <div className="mx-auto max-w-[1130px] px-6 py-12">
      <div className="grid gap-8 border-b border-white/15 pb-9 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><BrandLockup size="md" tone="light" tagline="FLUENCY COMES FIRST" className="mb-3" /><p className="max-w-xs text-[10px] leading-6 text-white/65">تعليم إنجليزي منظم وعملي، مبني حول ما تحتاج أن تقوله في حياتك بالفعل.</p></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">اكتشف</p><div className="flex flex-col gap-2 text-[11px] text-white/75"><Link href="/packages">الباقات</Link><Link href="/learning-path">طريقة التعلم</Link><Link href="/placement-test">اختبار المستوى</Link></div></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">تواصل</p><p className="text-[11px] text-white/75">support@befluent-edu.online</p><p dir="ltr" className="mt-2 text-[11px] text-white/75">+20 109 151 5594</p></div>
      </div>
      <div className="flex flex-col justify-between gap-2 pt-5 text-[9px] text-white/45 md:flex-row"><span>FLUENCY COMES FIRST</span><span>© 2025 Be Fluent Academy</span></div>
      <div className="mt-5 border-t border-white/10 pt-4 text-center text-[9px] text-white/55"><span>Made by </span><a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer" className="font-bold text-white transition hover:text-[#75c7a1]">Qirox Studio group</a></div>
    </div>
  </footer>
}

export function MarketingFrame({ children }: { children: ReactNode }) {
  const { language } = useTheme()
  return <main dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-[100dvh] bg-[#fdfcf8] font-sans text-[#1e2b29]"><MarketingHeader />{children}<MarketingFooter /></main>
}