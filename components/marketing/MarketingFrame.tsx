'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

const links = [
  { href: '/learning-path', label: 'كيف نبدأ' },
  { href: '/about-path', label: 'المسار' },
  { href: '/packages', label: 'الباقات' },
  { href: '/grammar', label: 'القواعد' },
  { href: '/contact', label: 'تواصل معنا' },
]

export function MarketingHeader() {
  const [open, setOpen] = useState(false)
  return <header dir="rtl" className="border-b border-[#dfe5dd] bg-[#fdfcf8] text-[#1e2b29]">
    <div className="mx-auto flex h-[70px] max-w-[1130px] items-center justify-between px-5">
      <Link href="/" className="relative h-10 w-[126px] overflow-hidden" aria-label="Be Fluent">
        <Image src="/logo.png" alt="Be Fluent" width={126} height={115} className="absolute left-0 top-1/2 h-auto w-full -translate-y-1/2" priority />
      </Link>
      <nav className="hidden items-center gap-6 text-[11px] font-bold text-[#52615b] md:flex">
        {links.map(link => <Link key={link.href} href={link.href} className="transition-colors hover:text-[#147050]">{link.label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <span className="px-2 text-[10px] font-bold text-[#64716c]">EN</span>
        <Link href="/auth/login" className="border border-[#cfd8d1] px-4 py-2 text-[11px] font-bold transition hover:border-[#147050]">دخول</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-2 text-[11px] font-bold text-[#fffef9] transition hover:bg-[#0e5940]">ابدأ معنا</Link>
      </div>
      <button onClick={() => setOpen(!open)} aria-label="القائمة" className="p-2 md:hidden">{open ? <X size={19} /> : <Menu size={19} />}</button>
    </div>
    {open && <div className="border-t border-[#dfe5dd] px-5 py-4 md:hidden">
      <nav className="mx-auto flex max-w-[1130px] flex-col gap-3 text-sm font-bold">
        {links.map(link => <Link onClick={() => setOpen(false)} key={link.href} href={link.href}>{link.label}</Link>)}
        <Link href="/auth/login">دخول</Link>
        <Link href="/auth/register" className="bg-[#147050] px-4 py-3 text-center text-white">ابدأ معنا</Link>
      </nav>
    </div>}
  </header>
}

export function MarketingFooter() {
  return <footer dir="rtl" className="bg-[#152b27] text-[#eff1e9]">
    <div className="mx-auto max-w-[1130px] px-6 py-12">
      <div className="grid gap-8 border-b border-white/15 pb-9 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><Image src="/logo.png" alt="Be Fluent" width={120} height={42} className="mb-3 brightness-0 invert" /><p className="max-w-xs text-[10px] leading-6 text-white/65">تعليم إنجليزي منظم وعملي، مبني حول ما تحتاج أن تقوله في حياتك بالفعل.</p></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">اكتشف</p><div className="flex flex-col gap-2 text-[11px] text-white/75"><Link href="/packages">الباقات</Link><Link href="/learning-path">طريقة التعلم</Link><Link href="/placement-test">اختبار المستوى</Link></div></div>
        <div><p className="mb-3 text-[10px] font-bold tracking-[.18em] text-[#75c7a1]">تواصل</p><p className="text-[11px] text-white/75">support@befluent-edu.online</p><p dir="ltr" className="mt-2 text-[11px] text-white/75">+20 109 151 5594</p></div>
      </div>
      <div className="flex flex-col justify-between gap-2 pt-5 text-[9px] text-white/45 md:flex-row"><span>FLUENCY COMES FIRST</span><span>© 2025 Be Fluent Academy</span></div>
    </div>
  </footer>
}

export function MarketingFrame({ children }: { children: ReactNode }) {
  return <main dir="rtl" className="min-h-[100dvh] bg-[#fdfcf8] font-sans text-[#1e2b29]"><MarketingHeader />{children}<MarketingFooter /></main>
}