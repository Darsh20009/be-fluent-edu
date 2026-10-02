'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import BrandLockup from '@/components/brand/BrandLockup'
import LanguageToggle from '@/components/LanguageToggle'
import { localeText } from '@/lib/locale'

type Gender = 'FEMALE' | 'MALE' | 'PREFER_NOT_TO_SAY'

const learningGoals = [
  { value: 'Improve speaking confidence', ar: 'التحدث بثقة أكبر', en: 'Speak with more confidence' },
  { value: 'Use English at work or school', ar: 'استخدام الإنجليزية في العمل أو الدراسة', en: 'Use English at work or school' },
  { value: 'Prepare for travel', ar: 'الاستعداد للسفر', en: 'Prepare for travel' },
  { value: 'Prepare for an exam', ar: 'الاستعداد لاختبار', en: 'Prepare for an exam' },
] as const

export default function OnboardingPage() {
  const router = useRouter()
  const { language } = useTheme()
  const isArabic = language === 'ar'
  const tr = (ar: string, en: string) => localeText(language, ar, en)
  const [step, setStep] = useState<1 | 2>(1)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [goal, setGoal] = useState('')
  const [packageId, setPackageId] = useState('')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const currentPackageId = new URLSearchParams(window.location.search).get('packageId') || ''
    setPackageId(currentPackageId)

    let active = true
    fetch('/api/student/profile', { cache: 'no-store' })
      .then(async (response) => {
        if (!active) return
        if (response.status === 401) {
          const currentPath = `${window.location.pathname}${window.location.search}`
          router.replace(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
          return
        }
        if (!response.ok) {
          setError(isArabic
            ? 'تعذر تحميل ملفك الآن. أعد المحاولة.'
            : 'We could not load your profile. Please try again.')
          return
        }
        const user = await response.json()
        const profile = user?.StudentProfile
        if (typeof profile?.age === 'number') setAge(String(profile.age))
        if (['FEMALE', 'MALE', 'PREFER_NOT_TO_SAY'].includes(profile?.gender)) setGender(profile.gender)
        if (typeof profile?.goal === 'string') setGoal(profile.goal)
        setReady(true)
      })
      .catch(() => {
        if (active) setError(isArabic
          ? 'تعذر الاتصال. تحقق من اتصالك ثم أعد المحاولة.'
          : 'We could not connect. Check your connection and try again.')
      })

    return () => { active = false }
  }, [router, isArabic])

  const ageValue = Number(age)
  const canContinue = Number.isInteger(ageValue) && ageValue >= 5 && ageValue <= 100 && Boolean(gender)

  const saveProfile = async (includeGoal: boolean) => {
    if (!canContinue) {
      setError(tr('أدخل عمرك واختر إجابة للجنس للمتابعة.', 'Enter your age and choose a gender option to continue.'))
      return
    }
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          age: ageValue,
          gender,
          ...(includeGoal && goal ? { goal } : {}),
        }),
      })
      if (!response.ok) {
        setError(includeGoal && goal
          ? tr('تعذر حفظ البيانات الآن. يمكنك المتابعة دون حفظ الهدف التعليمي.', 'We could not save this yet. You can continue without saving the learning goal.')
          : tr('تعذر حفظ ملفك الآن. أعد المحاولة.', 'We could not save your profile. Please try again.'))
        return
      }
      const destination = packageId
        ? `/dashboard/student/checkout?packageId=${encodeURIComponent(packageId)}`
        : '/dashboard'
      router.push(destination)
      router.refresh()
    } catch {
      setError(tr('تعذر الاتصال لحفظ ملفك. أعد المحاولة.', 'We could not connect to save your profile. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  const backIcon = isArabic
    ? <ChevronRight size={16} aria-hidden="true" />
    : <ChevronLeft size={16} aria-hidden="true" />

  return (
    <main className="min-h-dvh bg-[#f5f7f3] px-4 py-8 sm:grid sm:place-items-center sm:px-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <section className="mx-auto w-full max-w-[520px] border border-[#dce4dc] bg-white px-5 py-7 sm:px-9 sm:py-9">
        <div className="mb-4 flex justify-end"><LanguageToggle /></div>
        <div className="mb-8">
          <BrandLockup
            size="md"
            tagline={tr('إعداد ملفك التعليمي', 'Learning profile setup')}
          />
        </div>

        <p className="bf-eyebrow">{tr('خطوة قصيرة لتخصيص تجربتك', 'A SHORT STEP TO PERSONALIZE YOUR LEARNING')}</p>
        <div className="mt-3 flex items-center justify-between text-xs font-medium text-[#68746c]">
          <span>{tr(`الخطوة ${step} من 2`, `Step ${step} of 2`)}</span>
          <span>{step === 1 ? '50%' : '100%'}</span>
        </div>
        <div className="mt-2 h-1.5 bg-[#edf1ec]" aria-hidden="true">
          <div className={`h-full bg-[#24714f] transition-[width] ${step === 1 ? 'w-1/2' : 'w-full'}`} />
        </div>

        {step === 1 ? (
          <>
            <h1 className="mt-7 text-2xl font-semibold text-[#202a25]">
              {tr('لنبدأ بالتعرّف عليك', 'Let’s get to know you')}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#65716a]">
              {tr('تساعدنا هذه المعلومات على تقديم تجربة تعليمية مناسبة. يمكنك تعديلها لاحقاً.', 'This helps us tailor your learning experience. You can change these details later.')}
            </p>

            <div className="mt-6">
              <label htmlFor="onboarding-age" className="mb-2 block text-sm font-semibold text-[#34443a]">
                {tr('العمر', 'Age')}
              </label>
              <input
                id="onboarding-age"
                type="number"
                inputMode="numeric"
                min={5}
                max={100}
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="18"
                disabled={!ready || busy}
                className="min-h-12 w-full border border-[#dce4dc] px-3 text-sm outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15 disabled:bg-[#f5f7f3]"
              />
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold text-[#34443a]">{tr('الجنس', 'Gender')}</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={tr('اختر الجنس', 'Choose a gender option')}>
                {([
                  ['FEMALE', tr('أنثى', 'Female')],
                  ['MALE', tr('ذكر', 'Male')],
                  ['PREFER_NOT_TO_SAY', tr('أفضل عدم الإفصاح', 'Prefer not to say')],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={gender === value}
                    disabled={!ready || busy}
                    onClick={() => setGender(value)}
                    className={`min-h-12 border px-3 text-sm transition-colors disabled:opacity-60 ${
                      gender === value
                        ? 'border-[#24714f] bg-[#f0f6f1] font-semibold text-[#1d5f42]'
                        : 'border-[#dce4dc] text-[#526157] hover:bg-[#f8faf7]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="button"
              disabled={!ready || !canContinue || busy}
              onClick={() => { setError(''); setStep(2) }}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {tr('متابعة', 'Continue')}
              {isArabic ? <ChevronLeft size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-7 text-2xl font-semibold text-[#202a25]">
              {tr('ما هدفك من الإنجليزية؟', 'What is your English goal?')}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#65716a]">
              {tr('اختر هدفاً ليساعدنا على توجيه تجربتك. هذه الخطوة اختيارية.', 'Choose a goal to help us tailor your experience. This step is optional.')}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {learningGoals.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={goal === item.value}
                  disabled={busy}
                  onClick={() => setGoal(goal === item.value ? '' : item.value)}
                  className={`flex min-h-14 items-center gap-3 border px-3 text-start text-sm transition-colors disabled:opacity-60 ${
                    goal === item.value
                      ? 'border-[#24714f] bg-[#f0f6f1] font-semibold text-[#1d5f42]'
                      : 'border-[#dce4dc] text-[#526157] hover:bg-[#f8faf7]'
                  }`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center border ${goal === item.value ? 'border-[#24714f] bg-[#24714f] text-white' : 'border-[#bcc8bf]'}`}>
                    {goal === item.value && <Check size={13} aria-hidden="true" />}
                  </span>
                  {isArabic ? item.ar : item.en}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={busy}
                onClick={() => { setError(''); setStep(1) }}
                className="inline-flex min-h-11 items-center justify-center gap-1 px-3 text-sm font-semibold text-[#526157] hover:bg-[#f4f6f3] disabled:opacity-50"
              >
                {backIcon}
                {tr('رجوع', 'Back')}
              </button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={busy || !ready}
                  onClick={() => void saveProfile(false)}
                  className="min-h-12 px-4 text-sm font-semibold text-[#526157] underline underline-offset-4 disabled:opacity-50"
                >
                  {tr('تخطي الهدف', 'Skip goal')}
                </button>
                <button
                  type="button"
                  disabled={busy || !ready}
                  onClick={() => void saveProfile(true)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-wait disabled:opacity-65"
                >
                  {busy ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
                  {tr('حفظ ومتابعة', 'Save and continue')}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-5 border border-[#eed7d4] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}