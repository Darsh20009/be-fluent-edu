'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { useEffect, useId, useRef, useState } from 'react'
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole, MessageCircle, Phone, X } from 'lucide-react'
import BFPhoneField from '@/components/auth/BFPhoneField'
import BrandLockup from '@/components/brand/BrandLockup'
import { getCountryByIso, toAsciiDigits, toInternationalPhone } from '@/lib/phone-countries'

type EntryMode = 'login' | 'start'
type AuthIntent = 'LOGIN' | 'REGISTER'
type ModalView = 'phone' | 'register' | 'code' | 'password' | 'passwordSetup'

type Props = {
  open: boolean
  entryMode: EntryMode
  returnTo: string
  registrationHref: string
  onClose: () => void
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
  const passwordInputId = useId()
  const [view, setView] = useState<ModalView>('phone')
  const [authIntent, setAuthIntent] = useState<AuthIntent>('LOGIN')
  const [countryIso, setCountryIso] = useState('EG')
  const [phoneInput, setPhoneInput] = useState('')
  const [pendingPhone, setPendingPhone] = useState('')
  const [code, setCode] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [registrationEmail, setRegistrationEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const nameRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    setView(entryMode === 'start' ? 'register' : 'phone')
    setAuthIntent(entryMode === 'start' ? 'REGISTER' : 'LOGIN')
    setCountryIso('EG')
    setPhoneInput('')
    setPendingPhone('')
    setCode('')
    setEmailOrPhone('')
    setPassword('')
    setShowPassword(false)
    setConfirmPassword('')
    setFullName('')
    setRegistrationEmail('')
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
      if (view === 'phone') document.getElementById('bf-auth-phone')?.focus()
      else if (view === 'register') nameRef.current?.focus()
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

  const onboardingDestination = () => {
    try {
      const packageId = new URL(registrationHref, 'https://befluent.invalid').searchParams.get('packageId')
      if (packageId && /^[\w-]{1,100}$/.test(packageId)) {
        return `/onboarding?packageId=${encodeURIComponent(packageId)}`
      }
    } catch {
      // Continue to profile setup without an optional package selection.
    }
    return '/onboarding'
  }

  const saveRegistrationPassword = async () => {
    setError('')
    try {
      const response = await fetch('/api/auth/password/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ password }),
      })
      const body: unknown = await response.json().catch(() => null)
      const data = body && typeof body === 'object' ? body as { ok?: unknown } : null
      if (!response.ok || data?.ok !== true) {
        setError(tr('تم التحقق من الهاتف، لكن تعذر حفظ كلمة المرور. حاول مرة أخرى.', 'Your phone is verified, but we could not save the password. Try again.'))
        return
      }
      onClose()
      router.push(onboardingDestination())
      router.refresh()
    } catch {
      setError(tr('تم التحقق من الهاتف، لكن تعذر الاتصال لحفظ كلمة المرور.', 'Your phone is verified, but we could not reach the service to save the password.'))
    }
  }

  const retryRegistrationPassword = async () => {
    setBusy(true)
    await saveRegistrationPassword()
    setBusy(false)
  }

  const requestCode = async () => {
    const normalizedPhone = toInternationalPhone(phoneInput, getCountryByIso(countryIso))
    if (!normalizedPhone) {
      setError(tr('أدخل رقم هاتف صحيحاً وفق الدولة المحددة.', 'Enter a valid phone number for the selected country.'))
      return
    }
    if (authIntent === 'REGISTER') {
      if (fullName.trim().length < 2) {
        setError(tr('أدخل اسمك الكامل.', 'Enter your full name.'))
        return
      }
      if (registrationEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registrationEmail.trim())) {
        setError(tr('تحقق من البريد الإلكتروني أو اتركه فارغاً.', 'Enter a valid email address or leave it blank.'))
        return
      }
      if (password.length < 8) {
        setError(tr('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.', 'Use a password with at least 8 characters.'))
        return
      }
      if (new TextEncoder().encode(password).byteLength > 72) {
        setError(tr('كلمة المرور طويلة جداً. استخدم 72 بايتاً أو أقل.', 'Password is too long. Use 72 bytes or fewer.'))
        return
      }
      if (password !== confirmPassword) {
        setError(tr('كلمتا المرور غير متطابقتين.', 'The passwords do not match.'))
        return
      }
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          intent: authIntent,
          channel: 'WHATSAPP',
          ...(authIntent === 'REGISTER'
            ? { name: fullName.trim(), email: registrationEmail.trim() || undefined }
            : {}),
        }),
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

      setPendingPhone(normalizedPhone)
      setCode('')
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
    if (!pendingPhone) {
      setView(authIntent === 'REGISTER' ? 'register' : 'phone')
      setError(tr('تحقق من رقم الهاتف ثم أعد المحاولة.', 'Check the phone number and try again.'))
      return
    }

    setBusy(true)
    setError('')
    try {
      const result = await signIn('otp', {
        phone: pendingPhone,
        code,
        intent: authIntent,
        redirect: false,
      })
      if (!result?.ok || result.error) {
        setError(tr('الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً.', 'That code is invalid or expired. Request a new one.'))
        return
      }
      if (authIntent === 'REGISTER') {
        setView('passwordSetup')
        await saveRegistrationPassword()
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

        <div className="mb-7 pe-10">
          <BrandLockup
            size="md"
            tagline={tr('الطلاقة تبدأ بخطوة واضحة', 'Fluency comes first')}
          />
        </div>

        <>
          <p className="bf-eyebrow">{tr('مساحتك التعليمية', 'YOUR LEARNING SPACE')}</p>
          <h2 id="bf-auth-title" className="mt-2 text-[25px] font-semibold text-[#202a25]">
            {view === 'code'
              ? authIntent === 'REGISTER'
                ? tr('تحقق من رقمك', 'Verify your phone')
                : tr('أدخل رمز التحقق', 'Enter your verification code')
              : view === 'passwordSetup'
                ? tr('أمّن حسابك', 'Secure your account')
              : view === 'password'
                ? tr('تسجيل الدخول بكلمة المرور', 'Sign in with your password')
                : view === 'register'
                  ? tr('أنشئ حسابك', 'Create your account')
                  : tr('أهلاً بعودتك', 'Welcome back')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#65716a]">
            {view === 'code'
              ? tr(`أرسلنا رمزاً إلى واتساب على ${pendingPhone}.`, `We sent a WhatsApp code to ${pendingPhone}.`)
              : view === 'passwordSetup'
                ? tr('تم التحقق من هاتفك. احفظ كلمة المرور للمتابعة إلى إعداد ملفك التعليمي.', 'Your phone is verified. Save your password to continue to your learning profile.')
              : view === 'password'
                ? tr('استخدم البريد الإلكتروني أو رقم الهاتف المسجل.', 'Use your registered email address or phone number.')
                : view === 'register'
                  ? tr('تحقق من هاتفك أولاً، ثم أكمل العمر والاهتمامات التعليمية في خطوة منفصلة.', 'Verify your phone first. You will add your age and learning details in the next step.')
                  : tr('تابع دروسك وممارستك وخطوتك التالية.', 'Continue your classes, practice, and next learning step.')}
          </p>

            {error && <p className="mt-5 border border-[#eed7d4] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}

            {view === 'phone' && (
              <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void requestCode() }}>
                <label htmlFor="bf-auth-phone" className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('رقم الهاتف', 'Mobile phone')}</label>
                <BFPhoneField
                  id="bf-auth-phone"
                  value={phoneInput}
                  countryIso={countryIso}
                  language={language}
                  onChange={setPhoneInput}
                  onCountryChange={setCountryIso}
                  placeholder={countryIso === 'EG' ? '10 1234 5678' : tr('رقمك المحلي', 'National number')}
                  disabled={busy}
                />
                <p className="mt-2 flex items-center gap-2 text-xs text-[#68746c]">
                  <MessageCircle size={14} className="shrink-0 text-[#24714f]" aria-hidden="true" />
                  {tr('سنرسل رمز الدخول عبر واتساب.', 'We will send a sign-in code through WhatsApp.')}
                </p>
                <button type="submit" disabled={busy} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
                  {tr('إرسال رمز واتساب', 'Send WhatsApp code')}
                </button>
              </form>
            )}

            {view === 'register' && (
              <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void requestCode() }}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('الاسم الكامل', 'Full name')}</span>
                  <input
                    ref={nameRef}
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                    required
                  />
                </label>
                <label htmlFor="bf-auth-phone" className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('رقم الهاتف', 'Mobile phone')}</label>
                <BFPhoneField
                  id="bf-auth-phone"
                  value={phoneInput}
                  countryIso={countryIso}
                  language={language}
                  onChange={setPhoneInput}
                  onCountryChange={setCountryIso}
                  placeholder={countryIso === 'EG' ? '10 1234 5678' : tr('رقمك المحلي', 'National number')}
                  disabled={busy}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">
                    {tr('البريد الإلكتروني', 'Email')}
                    <span className="ms-1 font-normal text-[#7c867f]">{tr('(اختياري)', '(optional)')}</span>
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={registrationEmail}
                    onChange={(event) => setRegistrationEmail(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('كلمة المرور', 'Password')}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('تأكيد كلمة المرور', 'Confirm password')}</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                    required
                  />
                </label>
                <p className="flex items-center gap-2 text-xs leading-5 text-[#68746c]">
                  <MessageCircle size={14} className="shrink-0 text-[#24714f]" aria-hidden="true" />
                  {tr('سنرسل رمز التحقق عبر واتساب. إعداد ملفك التعليمي يأتي بعد إنشاء الحساب.', 'We will send a WhatsApp verification code. Your learning profile comes after account creation.')}
                </p>
                <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Phone size={16} aria-hidden="true" />}
                  {tr('تحقق وأنشئ الحساب', 'Verify and create account')}
                </button>
              </form>
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
                  style={{ unicodeBidi: 'isolate' }}
                  value={code}
                  onChange={(event) => setCode(toAsciiDigits(event.target.value).replace(/\D/g, '').slice(0, 6))}
                  className="min-h-14 w-full border border-[#dce4dc] px-4 text-center font-['DM_Sans'] text-2xl font-semibold tracking-[0.25em] text-[#202a25] outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                  disabled={busy}
                />
                <button type="submit" disabled={busy || code.length !== 6} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-55">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                  {authIntent === 'REGISTER'
                    ? tr('تحقق وأنشئ الحساب', 'Verify and create account')
                    : tr('تحقق وتسجيل الدخول', 'Verify and sign in')}
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button type="button" disabled={busy} className="min-h-11 text-[#24714f] underline underline-offset-4 disabled:opacity-50" onClick={() => { setCode(''); setError(''); setView(authIntent === 'REGISTER' ? 'register' : 'phone') }}>
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

            {view === 'passwordSetup' && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-[#68746c]">
                  {tr('تم التحقق من ملكية الهاتف. احفظ كلمة المرور التي اخترتها للتمكن من تسجيل الدخول بها لاحقاً.', 'Your phone ownership is verified. Save the password you chose so you can use it to sign in later.')}
                </p>
                <button type="button" disabled={busy} onClick={() => void retryRegistrationPassword()} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65">
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                  {tr('حفظ ومتابعة', 'Save and continue')}
                </button>
              </div>
            )}

            {view === 'password' && (
              <form className="mt-6 space-y-4" onSubmit={signInWithPassword}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('البريد الإلكتروني أو الهاتف', 'Email or phone')}</span>
                  <input
                    type="text"
                    autoComplete="username"
                    dir="ltr"
                    style={{ unicodeBidi: 'isolate' }}
                    value={emailOrPhone}
                    onChange={(event) => setEmailOrPhone(event.target.value)}
                    className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    disabled={busy}
                    required
                  />
                </label>
                <div>
                  <label htmlFor={passwordInputId} className="mb-2 block text-sm font-semibold text-[#34443a]">{tr('كلمة المرور', 'Password')}</label>
                  <span className="relative block">
                    <LockKeyhole size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                    <input
                      id={passwordInputId}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-h-12 w-full border border-[#dce4dc] ps-10 pe-10 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                      disabled={busy}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#34443a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24714f]"
                      aria-label={showPassword ? tr('إخفاء كلمة المرور', 'Hide password') : tr('إظهار كلمة المرور', 'Show password')}
                      aria-pressed={showPassword}
                      disabled={busy}
                    >
                      {showPassword
                        ? <EyeOff size={18} aria-hidden="true" />
                        : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </span>
                </div>
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
                <button type="button" onClick={() => { setAuthIntent('REGISTER'); setError(''); setView('register') }} className="font-semibold text-[#24714f] underline underline-offset-4">
                  {tr('ابدأ التسجيل', 'Start registration')}
                </button>
              </p>
            )}

            {view === 'register' && (
              <p className="mt-4 text-center text-xs leading-6 text-[#68746c]">
                {tr('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                <button type="button" disabled={busy} onClick={() => { setAuthIntent('LOGIN'); setError(''); setPassword(''); setConfirmPassword(''); setView('phone') }} className="font-semibold text-[#24714f] underline underline-offset-4">
                  {tr('تسجيل الدخول', 'Sign in')}
                </button>
              </p>
            )}

            <button type="button" disabled={busy} onClick={onClose} className="mt-5 flex min-h-11 w-full items-center justify-center text-xs text-[#758078] disabled:opacity-50">
              {tr('متابعة التصفح', 'Continue browsing')}
            </button>
        </>
      </section>
    </div>
  )
}