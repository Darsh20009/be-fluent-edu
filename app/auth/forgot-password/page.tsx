'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowLeft, Check, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import LanguageToggle from '@/components/LanguageToggle'
import BrandLockup from '@/components/brand/BrandLockup'
import BFPhoneField from '@/components/auth/BFPhoneField'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { getCountryByIso, toAsciiDigits, toInternationalPhone } from '@/lib/phone-countries'

type Step = 'identity' | 'code' | 'password' | 'success'
type PendingIdentity = {
  phone?: string
  email?: string
  channel: 'WHATSAPP' | 'EMAIL'
}

function responseCode(body: unknown) {
  if (!body || typeof body !== 'object') return ''
  const error = (body as { error?: unknown }).error
  if (!error || typeof error !== 'object') return ''
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : ''
}

export default function ForgotPasswordPage() {
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const t = (ar: string, en: string) => isArabic ? ar : en
  const router = useRouter()
  const [step, setStep] = useState<Step>('identity')
  const [identityType, setIdentityType] = useState<'phone' | 'email'>('phone')
  const [countryIso, setCountryIso] = useState('EG')
  const [phoneInput, setPhoneInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [pendingIdentity, setPendingIdentity] = useState<PendingIdentity | null>(null)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resendIn, setResendIn] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => {
      setResendIn((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  const requestCode = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError('')

    let identity: PendingIdentity
    if (identityType === 'phone') {
      const phone = toInternationalPhone(phoneInput, getCountryByIso(countryIso))
      if (!phone) {
        setError(t('أدخل رقم هاتف صحيحاً وفق الدولة المحددة.', 'Enter a valid phone number for the selected country.'))
        return
      }
      identity = { phone, channel: 'WHATSAPP' }
    } else {
      const email = emailInput.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(t('أدخل بريداً إلكترونياً صحيحاً.', 'Enter a valid email address.'))
        return
      }
      identity = { email, channel: 'EMAIL' }
    }

    setBusy(true)
    try {
      const response = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...identity, intent: 'LOGIN' }),
      })
      const body: unknown = await response.json().catch(() => null)
      const result = body && typeof body === 'object'
        ? body as { ok?: unknown; resendAfterSeconds?: unknown }
        : null
      if (!response.ok || result?.ok !== true) {
        const reason = responseCode(body)
        if (reason === 'RATE_LIMITED') {
          setError(t('طلبت رموزاً عدة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.', 'Too many code requests in a short time. Please wait and try again.'))
        } else if (reason === 'OTP_SENDER_NOT_CONFIGURED') {
          setError(t(
            'لم يُحدّد رقم واتساب مرسلاً لرموز التحقق. يلزم من المسؤول اختيار رقم متصل في إدارة واتساب.',
            'No WhatsApp verification sender is selected. An admin must select a connected number in WhatsApp management.',
          ))
        } else if (reason === 'OTP_SENDER_CONFIGURATION_INVALID') {
          setError(t(
            'إعداد مرسل رموز واتساب غير صحيح. يلزم من المسؤول مراجعة الأرقام المحددة.',
            'WhatsApp verification sender settings are invalid. An admin must review the selected numbers.',
          ))
        } else {
          setError(t('تعذر إرسال رمز التحقق الآن. حاول مرة أخرى أو استخدم البريد الإلكتروني.', 'We could not send a verification code. Try again or use email.'))
        }
        return
      }

      setPendingIdentity(identity)
      setCode('')
      setResendIn(typeof result.resendAfterSeconds === 'number'
        ? Math.min(600, Math.max(0, result.resendAfterSeconds))
        : 60)
      setStep('code')
    } catch {
      setError(t('تعذر الاتصال بخدمة التحقق. حاول مرة أخرى.', 'We could not reach the verification service. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!pendingIdentity || !/^\d{6}$/.test(code)) {
      setError(t('أدخل رمز التحقق المكوّن من 6 أرقام.', 'Enter the 6-digit verification code.'))
      return
    }

    setBusy(true)
    try {
      const result = await signIn('otp', {
        phone: pendingIdentity.phone,
        email: pendingIdentity.email,
        code,
        intent: 'LOGIN',
        redirect: false,
      })
      if (!result?.ok || result.error) {
        setError(t('الرمز غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً.', 'That code is invalid or expired. Request a new one.'))
        return
      }
      setCode('')
      setStep('password')
    } catch {
      setError(t('تعذر التحقق من الرمز الآن. حاول مرة أخرى.', 'We could not verify the code. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError(t('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.', 'Use a password with at least 8 characters.'))
      return
    }
    if (new TextEncoder().encode(newPassword).byteLength > 72) {
      setError(t('كلمة المرور طويلة جداً. استخدم 72 بايتاً أو أقل.', 'Password is too long. Use 72 bytes or fewer.'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('كلمتا المرور غير متطابقتين.', 'The passwords do not match.'))
      return
    }

    setBusy(true)
    try {
      const response = await fetch('/api/auth/password/reset-after-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const body: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const reason = responseCode(body)
        setError(reason === 'UNAUTHORIZED'
          ? t('انتهت جلسة التحقق. ابدأ استعادة كلمة المرور من جديد.', 'Your verification session expired. Start password recovery again.')
          : t('تعذر تحديث كلمة المرور. حاول مرة أخرى.', 'We could not update your password. Please try again.'))
        return
      }

      setNewPassword('')
      setConfirmPassword('')
      setStep('success')
    } catch {
      setError(t('تعذر الاتصال لتحديث كلمة المرور. حاول مرة أخرى.', 'We could not reach the service to update your password.'))
    } finally {
      setBusy(false)
    }
  }

  const stepTitle = step === 'identity'
    ? t('استعادة كلمة المرور', 'Reset your password')
    : step === 'code'
      ? t('تحقق من هويتك', 'Verify your identity')
      : step === 'password'
        ? t('اختر كلمة مرور جديدة', 'Choose a new password')
        : t('تم تحديث كلمة المرور', 'Password updated')

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="flex min-h-[100dvh] flex-col bg-[#f4f6f0]">
      <AppHeader variant="marketing">
        <Link href="/auth/login" className="border border-[#147050] px-4 py-2 text-[11px] font-bold text-[#147050] transition-colors hover:bg-[#147050] hover:text-white">
          {t('تسجيل الدخول', 'Login')}
        </Link>
      </AppHeader>

      <main className="flex flex-1 items-center justify-center p-3 sm:p-5">
        <section className="w-full max-w-md border border-[#dbe3dc] bg-[#fffefa] p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <Link
              href="/auth/login"
              aria-label={t('العودة لتسجيل الدخول', 'Back to login')}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#147050] hover:bg-[#f2f6f1]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <LanguageToggle />
          </div>

          <div className="mb-6 flex justify-center">
            <BrandLockup size="md" />
          </div>

          <h1 className="text-center text-2xl font-bold text-[#1e2b29]">{stepTitle}</h1>

          {error && (
            <p className="mt-5 border border-[#eed7d4] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">
              {error}
            </p>
          )}

          {step === 'identity' && (
            <form onSubmit={(event) => void requestCode(event)} className="mt-6 space-y-4">
              <p className="text-sm leading-6 text-[#65716a]">
                {t('أرسل رمز تحقق إلى رقم الهاتف أو البريد المرتبط بحسابك.', 'We will send a verification code to the phone number or email linked to your account.')}
              </p>
              <div className="grid grid-cols-2 border border-[#dce4dc]">
                <button
                  type="button"
                  aria-pressed={identityType === 'phone'}
                  onClick={() => { setIdentityType('phone'); setError('') }}
                  className={`min-h-11 text-sm font-semibold ${identityType === 'phone' ? 'bg-[#eaf2ec] text-[#205c41]' : 'text-[#65716a]'}`}
                >
                  {t('رقم الهاتف', 'Phone')}
                </button>
                <button
                  type="button"
                  aria-pressed={identityType === 'email'}
                  onClick={() => { setIdentityType('email'); setError('') }}
                  className={`min-h-11 border-s border-[#dce4dc] text-sm font-semibold ${identityType === 'email' ? 'bg-[#eaf2ec] text-[#205c41]' : 'text-[#65716a]'}`}
                >
                  {t('البريد الإلكتروني', 'Email')}
                </button>
              </div>

              {identityType === 'phone' ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{t('رقم الهاتف', 'Phone number')}</span>
                  <BFPhoneField
                    id="forgot-phone"
                    value={phoneInput}
                    countryIso={countryIso}
                    language={language}
                    onChange={setPhoneInput}
                    onCountryChange={setCountryIso}
                    disabled={busy}
                    placeholder={countryIso === 'EG' ? '10 1234 5678' : t('رقمك المحلي', 'National number')}
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#34443a]">{t('البريد الإلكتروني', 'Email address')}</span>
                  <span className="relative block">
                    <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      disabled={busy}
                      required
                      dir="ltr"
                      className="min-h-12 w-full border border-[#dce4dc] px-10 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                    />
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65"
              >
                {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                {t('إرسال رمز التحقق', 'Send verification code')}
              </button>
            </form>
          )}

          {step === 'code' && pendingIdentity && (
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <p className="text-sm leading-6 text-[#65716a]">
                {pendingIdentity.phone
                  ? t(`أدخل الرمز المرسل عبر واتساب إلى ${pendingIdentity.phone}.`, `Enter the WhatsApp code sent to ${pendingIdentity.phone}.`)
                  : t(`أدخل الرمز المرسل إلى ${pendingIdentity.email}.`, `Enter the code sent to ${pendingIdentity.email}.`)}
              </p>
              <label htmlFor="forgot-otp-code" className="block text-sm font-semibold text-[#34443a]">
                {t('رمز التحقق', 'Verification code')}
              </label>
              <input
                id="forgot-otp-code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                dir="ltr"
                value={code}
                onChange={(event) => setCode(toAsciiDigits(event.target.value).replace(/\D/g, '').slice(0, 6))}
                disabled={busy}
                className="min-h-14 w-full border border-[#dce4dc] px-4 text-center text-2xl font-semibold tracking-[0.25em] text-[#202a25] outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
              />
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                {t('تحقق من الرمز', 'Verify code')}
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { setStep('identity'); setCode(''); setResendIn(0); setError('') }}
                  className="min-h-11 text-[#24714f] underline underline-offset-4 disabled:opacity-50"
                >
                  {t('تغيير رقم الهاتف أو البريد', 'Change phone or email')}
                </button>
                <button
                  type="button"
                  disabled={busy || resendIn > 0}
                  onClick={() => void requestCode()}
                  className="min-h-11 text-[#526157] underline underline-offset-4 disabled:no-underline disabled:opacity-55"
                >
                  {resendIn > 0
                    ? t(`إعادة الإرسال بعد ${resendIn} ث`, `Resend in ${resendIn}s`)
                    : t('إعادة إرسال الرمز', 'Resend code')}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={resetPassword} className="mt-6 space-y-4">
              <p className="text-sm leading-6 text-[#65716a]">
                {t('تم التحقق من هويتك. اختر كلمة مرور جديدة لحسابك.', 'Your identity is verified. Choose a new password for your account.')}
              </p>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34443a]">{t('كلمة مرور جديدة', 'New password')}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={busy}
                  required
                  className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34443a]">{t('تأكيد كلمة المرور', 'Confirm password')}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={busy}
                  required
                  className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65"
              >
                {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}
                {t('تحديث كلمة المرور', 'Update password')}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="mt-6 space-y-5 text-center">
              <p className="text-sm leading-6 text-[#526157]">
                {t('تم تحديث كلمة المرور بنجاح. أنت مسجل الدخول الآن.', 'Your password has been updated. You are signed in now.')}
              </p>
              <button
                type="button"
                onClick={() => { router.push('/'); router.refresh() }}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42]"
              >
                {t('متابعة إلى حسابك', 'Continue to your account')}
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto w-full border-t border-[#dfe5dd] bg-[#fdfcf8] py-4 text-center text-[10px] text-[#68756f]">
        <p className="px-4">Be Fluent Academy</p>
      </footer>
    </div>
  )
}