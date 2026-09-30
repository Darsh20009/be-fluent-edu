'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useEffect, useRef, useState } from 'react'
import { Check, LoaderCircle, LockKeyhole, MessageCircle, Phone, X } from 'lucide-react'

type EntryMode = 'login' | 'start'
type ModalView = 'phone' | 'code' | 'password'

type Props = {
  open: boolean
  entryMode: EntryMode
  returnTo: string
  registrationHref: string
  onClose: () => void
}

function toEgyptNumber(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('20')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.length >= 10 && digits.length <= 11 ? `+20${digits}` : ''
}

function friendlyOtpError(code: string, isArabic: boolean) {
  if (code === 'RATE_LIMITED') {
    return isArabic
      ? 'طلبت رموزاً عدة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.'
      : 'Too many code requests in a short time. Please wait and try again.'
  }
  if (code === 'DELIVERY_UNAVAILABLE') {
    return isArabic
      ? 'التحقق عبر واتساب غير متاح مؤقتاً. يمكنك تسجيل الدخول بكلمة المرور.'
      : 'WhatsApp verification is temporarily unavailable. You can use your password instead.'
  }
  return isArabic
    ? 'تعذر إرسال الرمز الآن. حاول مرة أخرى أو استخدم كلمة المرور.'
    : 'We could not send a code right now. Try again or use your password.'
}

export default function BFAuthModal({ open, entryMode, returnTo, registrationHref, onClose }: Props) {
  const router = useRouter()
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const tr = (ar: string, en: string) => isArabic ? ar : en
  const [view, setView] = useState<ModalView>('phone')
  const [phoneInput, setPhoneInput] = useState('')
  const [code, setCode] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const phoneRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    setView('phone')
    setPhoneInput('')
    setCode('')
    setEmailOrPhone('')
    setPassword('')
    setError('')
    setBusy(false)
    setResendIn(0)
  }, [open, entryMode])

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const focusTimer = window.setTimeout(() => {
      if (view === 'phone') phoneRef.current?.focus()
      else panelRef.current?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, view, onClose])

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setInterval(() => setResendIn((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendIn])

  if (!open) return null

  const requestCode = async () => {
    const normalizedPhone = toEgyptNumber(phoneInput)
    if (!normalizedPhone) {
      setError(tr('أدخل رقم هاتف مصرياً صحيحاً.', 'Enter a valid Egyptian mobile number.'))
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, intent: 'LOGIN', channel: 'WHATSAPP' }),
      })
      const body: unknown = await response.json().catch(() => null)
      const data = body && typeof body === 'object' ? body as {
        ok?: unknown
        channel?: unknown
        resendAfterSeconds?: unknown
        error?: { code?: unknown }
      } : null

      if (!response.ok || data?.ok !== true) {
        setError(friendlyOtpError(String(data?.error?.code || ''), isArabic))
        return
      }

      setPhoneInput(normalizedPhone)
      setResendIn(typeof data.resendAfterSeconds === 'number'
        ? Math.min(600, Math.max(0, data.resendAfterSeconds))
        : 60)
      setView('code')
    } catch {
      setError(tr('تعذر الاتصال بخدمة التحقق. حاول مرة أخرى.', 'We could not reach the verification service. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      setError(tr('أدخل الرمز المكوّن من 6 أرقام.', 'Enter the 6-digit verification code.'))
      return
    }
    const normalizedPhone = toEgyptNumber(phoneInput)
    if (!normalizedPhone) {
      setView('phone')
      setError(tr('تحقق من رقم الهاتف ثم أعد المحاولة.', 'Check the phone number and try again.'))
      return
    }

    setBusy(true)
    setError('')
    try {
      const result = await signIn('otp', {
        phone: normalizedPhone,
        code,
        intent: 'LOGIN',
        redirect: false,
      })
      if (!result?.ok || result.error) {
        setError(tr('الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً.', 'That code is invalid or expired. Request a new one.'))
        return
      }
      onClose()
      router.push(returnTo)
      router.refresh()
    } catch {
      setError(tr('تعذر تسجيل الدخول الآن. حاول مرة أخرى.', 'We could not sign you in. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const signInWithPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!emailOrPhone.trim() || !password) {
      setError(tr('أدخل البريد أو الهاتف وكلمة المرور.', 'Enter your email or phone and password.'))
      return
    }

    setBusy(true)
    setError('')
    try {
      const result = await signIn('credentials', {
        emailOrPhone: emailOrPhone.trim(),
        password,
        redirect: false,
      })
      if (!result?.ok || result.error) {
        setError(tr('تعذر تسجيل الدخول بهذه البيانات.', 'We could not sign you in with those details.'))
        return
      }
      onClose()
      router.push(returnTo)
      router.refresh()
    } catch {
      setError(tr('تعذر تسجيل الدخول الآن. حاول مرة أخرى.', 'We could not sign you in. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17251f]/40 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <section
        ref={panelRef}
        aria-labelledby="bf-auth-title"
        aria-modal="true"
        className="relative max-h-[min(92dvh,720px)] w-full max-w-[440px] overflow-y-auto border border-[#dce4dc] bg-white px-5 py-6 sm:px-8 sm:py-8"
        dir={isArabic ? 'rtl' : 'ltr'}
        role="dialog"
        tabIndex={-1}
      >
        <button
          type="button"
          aria-label={tr('إغلاق', 'Close')}
          disabled={busy}
          onClick={onClose}
          className="absolute end-4 top-4 grid h-11 w-11 place-items-center text-[#66736b] hover:bg-[#f4f6f3] disabled:opacity-50"
        >
          <X size={19} aria-hidden="true" />
        </button>

        <div className="mb-7 flex items-center gap-3 pe-10">
          <Image src="/logo.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" />
          <div>
            <p className="font-semibold text-[#24342b]">Be Fluent EDU</p>
            <p className="text-[11px] text-[#68746c]">{tr('الطلاقة تبدأ بخطوة واضحة', 'Fluency comes first')}</p>
          </div>
        </div>

        <>
          <p className="bf-eyebrow">{tr('مساحتك التعليمية', 'YOUR LEARNING SPACE')}</p>
          <h2 id="bf-auth-title" className="mt-2 text-[25px] font-semibold text-[#202a25]">
            {view === 'code'
              ? tr('أدخل رمز التحقق', 'Enter your verification code')
              : view === 'password'
                ? tr('تسجيل الدخول بكلمة المرور', 'Sign in with your password')
                : entryMode === 'start'
                  ? tr('ابدأ رحلة التعلّم', 'Start your learning journey')
                  : tr('أهلاً بعودتك', 'Welcome back')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#65716a]">
            {view === 'code'
              ? tr(`أرسلنا رمزاً إلى واتساب على ${phoneInput}.`, `We sent a WhatsApp code to ${phoneInput}.`)
              : view === 'password'
                ? tr('استخدم البريد الإلكتروني أو رقم الهاتف المسجل.', 'Use your registered email address or phone number.')
                : entryMode === 'start'
                  ? tr('أدخل رقم هاتفك للمتابعة. إذا كنت مستخدماً جديداً، ابدأ التسجيل من الرابط أدناه.', 'Enter your phone number to continue. If you are new, use the registration link below.')
                  : tr('تابع دروسك وممارستك وخطوتك التالية.', 'Continue your classes, practice, and next learning step.')}
          </p>

            {error && <p className="mt-5 border border-[#eed7d4] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}

            {view === 'phone' && (
              <div className="mt-6">
                <label htmlFor="bf-auth-phone" className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('رقم الهاتف', 'Mobile phone')}</label>
                <div className="flex min-h-12 items-center border border-[#dce4dc] focus-within:border-[#24714f] focus-within:ring-2 focus-within:ring-[#24714f]/15">
                  <span className={`flex h-12 shrink-0 items-center gap-2 border-[#e4e9e4] px-3 text-sm font-semibold text-[#526157] ${isArabic ? 'border-s' : 'border-e'}`} dir="ltr">
                    <span aria-hidden="true">+20</span>
                    <span className="text-xs font-medium text-[#7c867f]">{tr('مصر', 'EG')}</span>
                  </span>
                  <input
                    ref={phoneRef}
                    id="bf-auth-phone"
                    autoComplete="tel-national"
                    inputMode="tel"
                    type="tel"
                    dir="ltr"
                    value={phoneInput}
                    onChange={(event) => setPhoneInput(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void requestCode() } }}
                    placeholder="10 1234 5678"
                    className="min-w-0 min-h-12 flex-1 bg-transparent px-3 text-sm text-[#202a25] outline-none placeholder:text-[#9aa49d]"
                    disabled={busy}
                  />
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-[#68746c]">
                  <MessageCircle size={14} className="shrink-0 text-[#24714f]" aria-hidden="true" />
                  {tr('سنرسل رمز الدخول عبر واتساب.', 'We will send a sign-in code through WhatsApp.')}
                </p>
                <button type="button" disabled={busy} onClick={() => void requestCode()} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
                  {tr('إرسال رمز واتساب', 'Send WhatsApp code')}
                </button>
              </div>
            )}

            {view === 'code' && (
              <form className="mt-6" onSubmit={verifyCode}>
                <label htmlFor="bf-auth-code" className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('رمز التحقق', 'Verification code')}</label>
                <input
                  id="bf-auth-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  dir="ltr"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="min-h-14 w-full border border-[#dce4dc] px-4 text-center font-['DM_Sans'] text-2xl font-semibold tracking-[0.25em] text-[#202a25] outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                  disabled={busy}
                />
                <button type="submit" disabled={busy || code.length !== 6} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-55">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                  {tr('تحقق وتسجيل الدخول', 'Verify and sign in')}
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button type="button" className="min-h-11 text-[#24714f] underline underline-offset-4" onClick={() => { setCode(''); setError(''); setView('phone') }}>
                    {tr('تغيير الرقم', 'Change number')}
                  </button>
                  <button type="button" disabled={busy || resendIn > 0} className="min-h-11 text-[#526157] underline underline-offset-4 disabled:no-underline disabled:opacity-55" onClick={() => void requestCode()}>
                    {resendIn > 0
                      ? tr(`إعادة الإرسال بعد ${resendIn} ث`, `Resend in ${resendIn}s`)
                      : tr('إعادة إرسال الرمز', 'Resend code')}
                  </button>
                </div>
              </form>
            )}

            {view === 'password' && (
              <form className="mt-6 space-y-4" onSubmit={signInWithPassword}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('البريد الإلكتروني أو الهاتف', 'Email or phone')}</span>
                  <input
                    type="text"
                    autoComplete="username"
                    value={emailOrPhone}
                    onChange={(event) => setEmailOrPhone(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('كلمة المرور', 'Password')}</span>
                  <span className="relative block">
                    <LockKeyhole size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-h-12 w-full border border-[#dce4dc] ps-10 pe-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                      disabled={busy}
                      required
                    />
                  </span>
                </label>
                <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                  {tr('تسجيل الدخول', 'Sign in')}
                </button>
                <Link href="/auth/forgot-password" data-bf-auth-bypass className="block min-h-11 pt-2 text-center text-xs font-semibold text-[#24714f] underline underline-offset-4" onClick={onClose}>
                  {tr('نسيت كلمة المرور؟', 'Forgot your password?')}
                </Link>
              </form>
            )}

            {view === 'phone' && (
              <button type="button" onClick={() => { setError(''); setView('password') }} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold text-[#526157] underline underline-offset-4">
                <LockKeyhole size={14} aria-hidden="true" />
                {tr('استخدام كلمة المرور بدلاً من ذلك', 'Use a password instead')}
              </button>
            )}

            {view === 'phone' && (
              <p className="mt-5 text-center text-xs leading-6 text-[#68746c]">
                {tr('مستخدم جديد؟', 'New to Be Fluent?')}{' '}
                <Link href={registrationHref} data-bf-auth-bypass onClick={onClose} className="font-semibold text-[#24714f] underline underline-offset-4">
                  {tr('ابدأ التسجيل', 'Start registration')}
                </Link>
              </p>
            )}

            <button type="button" onClick={onClose} className="mt-5 flex min-h-11 w-full items-center justify-center text-xs text-[#758078]">
              {tr('متابعة التصفح', 'Continue browsing')}
            </button>
        </>
      </section>
    </div>
  )
}