'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, LoaderCircle, Mic, Square } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import LanguageToggle from '@/components/LanguageToggle'
import BrandLockup from '@/components/brand/BrandLockup'

const TOTAL = 10
const SPEAKING_PROMPT = 'I want to improve my English because it will help me reach my goals.'
const MAX_RECORDING_BYTES = 700 * 1024

const LEVEL_INFO: Record<string, { label: string; labelEn: string; description: string; descriptionEn: string }> = {
  A1: { label: 'مبتدئ', labelEn: 'Beginner', description: 'سنبدأ بالعبارات اليومية وأساسيات اللغة.', descriptionEn: 'Start with everyday phrases and the foundations of English.' },
  A2: { label: 'مبتدئ متقدم', labelEn: 'Elementary', description: 'ابنِ على أساسك وتدرّب على مواقف الحياة اليومية.', descriptionEn: 'Build on your foundation and practise everyday situations.' },
  B1: { label: 'متوسط', labelEn: 'Intermediate', description: 'طوّر تواصلك في الدراسة والعمل والسفر.', descriptionEn: 'Develop your communication for study, work, and travel.' },
  B2: { label: 'متوسط متقدم', labelEn: 'Upper intermediate', description: 'حسّن طلاقتك ودقّتك في موضوعات متنوعة.', descriptionEn: 'Improve fluency and accuracy across a wider range of topics.' },
  C1: { label: 'متقدم', labelEn: 'Advanced', description: 'صقل الطلاقة وفهم اللغة في السياقات الدقيقة.', descriptionEn: 'Refine fluency and understand English in nuanced contexts.' },
  C2: { label: 'إتقان', labelEn: 'Proficient', description: 'حافظ على مستوى متقدم ووسّع استخدامك المتخصص للغة.', descriptionEn: 'Maintain a high level and extend your specialised use of English.' },
}

const PACKAGE_FORMAT_LABELS: Record<string, { ar: string; en: string }> = {
  GROUP: { ar: 'مجموعة', en: 'Group' },
  DUO: { ar: 'ثنائي', en: 'Duo' },
  PRIVATE: { ar: 'فردي', en: 'Individual' },
  SMALL_GROUP: { ar: 'مجموعة صغيرة', en: 'Small group' },
}

type Question = {
  id: string
  text: string
  options: string[]
  level: string
  band: string
  category: string
}

type RecommendedPackage = {
  id: string
  title: string
  titleAr: string
  price: number
  currency: string | null
  lessonsCount: number
  lessonsPerWeek: number | null
  durationDays: number
  subscriptionType: string | null
}

type PlacementResult = {
  level: string
  band: string
  score: number
  total: number
  percentage: number
  recommendedPackages: RecommendedPackage[]
}

type SpeakingReview = {
  id: string
  mode: 'RECORDING' | 'MEETING'
  status: string
}

async function readResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return {}
  }
}

function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the recording.'))
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      const comma = dataUrl.indexOf(',')
      if (comma < 0) reject(new Error('Could not prepare the recording.'))
      else resolve(dataUrl.slice(comma + 1))
    }
    reader.readAsDataURL(blob)
  })
}

export default function PlacementTestContent() {
  const { language } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isArabic = language === 'ar'
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const fromRegistration = searchParams.get('fromRegistration') === 'true'
  const requestedNext = searchParams.get('next') || ''
  const nextDestination = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : ''
  const [phase, setPhase] = useState<'intro' | 'loading' | 'testing' | 'speaking' | 'result'>('intro')
  const [question, setQuestion] = useState<Question | null>(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [attemptId, setAttemptId] = useState('')
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<PlacementResult | null>(null)
  const [review, setReview] = useState<SpeakingReview | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const startedAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!recordedBlob) {
      setRecordingUrl('')
      return
    }
    const url = URL.createObjectURL(recordedBlob)
    setRecordingUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [recordedBlob])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const startTest = useCallback(async () => {
    setError('')
    setPhase('loading')
    try {
      const response = await fetch('/api/ai/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })
      const data = await readResponse(response)
      if (!response.ok || !data.success || !data.question || !data.attemptId) {
        throw new Error(data.error || t('تعذر تحميل الاختبار. حاول مرة أخرى.', 'Could not load the test. Please try again.'))
      }
      setAttemptId(data.attemptId)
      setQuestion(data.question as Question)
      setQuestionNumber(1)
      setSelected('')
      setPhase('testing')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('تعذر الاتصال بالخادم.', 'Could not connect to the server.'))
      setPhase('intro')
    }
  }, [t])

  const submitAnswer = useCallback(async () => {
    if (!selected || !question || !attemptId || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/ai/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer',
          attemptId,
          questionId: question.id,
          answer: selected,
        }),
      })
      const data = await readResponse(response)
      if (!response.ok || !data.success) {
        throw new Error(data.error || t('تعذر حفظ إجابتك. حاول مرة أخرى.', 'Could not save your answer. Please retry.'))
      }
      if (data.level) {
        setResult(data as PlacementResult)
        setQuestion(null)
        setPhase('speaking')
      } else if (data.question) {
        setQuestion(data.question as Question)
        setQuestionNumber(data.questionNumber)
        setSelected('')
      } else {
        throw new Error(t('لم يصل السؤال التالي. حاول مرة أخرى.', 'The next question was not returned. Please retry.'))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('تعذر الاتصال بالخادم.', 'Could not connect to the server.'))
    } finally {
      setBusy(false)
    }
  }, [attemptId, busy, question, selected, t])

  const stopRecording = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  const startRecording = async () => {
    setError('')
    setRecordedBlob(null)
    setRecordingDuration(0)
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error(t('تسجيل الصوت غير مدعوم في هذا المتصفح.', 'Audio recording is not supported in this browser.'))
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const supportedType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream)
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setRecording(false)
        setRecordingDuration(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)))
        if (blob.size > MAX_RECORDING_BYTES) {
          setError(t('التسجيل أكبر من الحد المسموح. أعده لمدة أقصر.', 'The recording is too large. Please make a shorter recording.'))
          setRecordedBlob(null)
        } else if (blob.size) {
          setRecordedBlob(blob)
        }
      }
      recorder.start()
      setRecording(true)
      timerRef.current = setTimeout(stopRecording, 45_000)
    } catch (caught) {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setRecording(false)
      setError(caught instanceof Error
        ? caught.message
        : t('لم نتمكن من استخدام الميكروفون. تحقق من الإذن وحاول مرة أخرى.', 'Microphone access failed. Check your permission and retry.'))
    }
  }

  const submitSpeaking = async (mode: 'RECORDING' | 'MEETING') => {
    if (!attemptId || busy || (mode === 'RECORDING' && !recordedBlob)) return
    setBusy(true)
    setError('')
    try {
      const body = mode === 'MEETING'
        ? { mode, attemptId }
        : {
            mode,
            attemptId,
            audioBase64: await fileToBase64(recordedBlob!),
            mimeType: recordedBlob!.type || 'audio/webm',
            duration: recordingDuration,
            promptText: SPEAKING_PROMPT,
          }
      const response = await fetch('/api/student/placement-speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await readResponse(response)
      if (!response.ok || !data.success) {
        throw new Error(data.error || t('تعذر إرسال طلبك. حاول مرة أخرى.', 'Could not submit your response. Please retry.'))
      }
      setReview(data.review as SpeakingReview)
      setPhase('result')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('تعذر الاتصال بالخادم.', 'Could not connect to the server.'))
    } finally {
      setBusy(false)
    }
  }

  const startAgain = () => {
    setAttemptId('')
    setQuestion(null)
    setResult(null)
    setReview(null)
    setRecordedBlob(null)
    setQuestionNumber(0)
    setError('')
    setPhase('intro')
  }

  const direction = isArabic ? 'rtl' : 'ltr'

  if (phase === 'loading') {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f5f7f3] px-5" dir={direction}>
        <div className="text-center">
          <LoaderCircle className="mx-auto mb-4 animate-spin text-[#24714f]" size={32} aria-hidden="true" />
          <p className="text-sm text-[#526157]">{t('جارٍ تجهيز اختبارك…', 'Preparing your placement test…')}</p>
        </div>
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f5f7f3] px-4 py-8 sm:px-6" dir={direction}>
        <section className="w-full max-w-xl border border-[#dce4dc] bg-white p-6 sm:p-9">
          <div className="mb-7 flex items-center justify-between gap-4">
            <BrandLockup size="sm" />
            <LanguageToggle />
          </div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#718077]">{t('تقييم قصير لمستواك', 'A SHORT CHECK OF YOUR ENGLISH')}</p>
          <h1 className="mt-3 text-2xl font-semibold text-[#202a25] sm:text-3xl">{t('اختبار تحديد المستوى', 'Placement test')}</h1>
          <p className="mt-3 text-sm leading-7 text-[#5e6b62]">
            {t('أجب عن 10 أسئلة تتدرج حسب إجاباتك. بعدها سجّل جملة قصيرة أو اطلب موعداً لمراجعة التحدث.', 'Answer 10 questions that adapt to your responses. Then record a short sentence or request a speaking review meeting.')}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="border border-[#e3e9e3] bg-[#f8faf7] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#34443a]"><Check size={16} aria-hidden="true" />{t('10 أسئلة', '10 questions')}</div>
              <p className="mt-1 text-xs leading-5 text-[#69766e]">{t('اختيار من متعدد بمستوى متدرج', 'Adaptive multiple-choice questions')}</p>
            </div>
            <div className="border border-[#e3e9e3] bg-[#f8faf7] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#34443a]"><Clock3 size={16} aria-hidden="true" />{t('نحو 10 دقائق', 'About 10 minutes')}</div>
              <p className="mt-1 text-xs leading-5 text-[#69766e]">{t('النتيجة مع اقتراحات مناسبة', 'Result with matching package suggestions')}</p>
            </div>
          </div>
          {error && <p className="mt-5 border border-[#ead2cf] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}
          <button
            type="button"
            onClick={() => void startTest()}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#1d5f42]"
          >
            {t('ابدأ الاختبار', 'Start the test')}
            {isArabic ? <ChevronLeft size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-[#69766e] underline underline-offset-4">
            {t('العودة للرئيسية', 'Back to home')}
          </Link>
        </section>
      </main>
    )
  }

  if (phase === 'testing' && question) {
    const progress = Math.round(questionNumber / TOTAL * 100)
    const category = question.category === 'reading'
      ? t('فهم المقروء', 'Reading')
      : question.category === 'vocabulary'
        ? t('المفردات', 'Vocabulary')
        : t('القواعد', 'Grammar')
    return (
      <main className="min-h-dvh bg-[#f5f7f3] px-4 py-6 sm:grid sm:place-items-center sm:px-6" dir={direction}>
        <section className="mx-auto w-full max-w-2xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <LanguageToggle />
            <span className="text-sm font-medium text-[#59665e]">
              {t(`السؤال ${questionNumber} من ${TOTAL}`, `Question ${questionNumber} of ${TOTAL}`)}
            </span>
            <span className="border border-[#dce4dc] bg-white px-3 py-2 text-xs font-semibold text-[#34443a]">{question.band}</span>
          </div>
          <div className="mb-5 h-1.5 bg-[#e5ebe4]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[#24714f] transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <div className="border border-[#dce4dc] bg-white">
            <div className="p-5 sm:p-8">
              <p className="text-xs font-semibold text-[#24714f]">{category}</p>
              <h1 className="mt-3 text-xl font-semibold leading-8 text-[#202a25] sm:text-2xl">{question.text}</h1>
              <div className="mt-6 grid gap-2.5">
                {question.options.map((option, index) => {
                  const active = selected === option
                  return (
                    <button
                      key={`${question.id}-${index}`}
                      type="button"
                      aria-pressed={active}
                      disabled={busy}
                      onClick={() => setSelected(option)}
                      className={`flex min-h-12 items-center gap-3 border px-3 text-start text-sm transition-colors ${
                        active ? 'border-[#24714f] bg-[#f0f6f1] font-semibold text-[#1d5f42]' : 'border-[#dce4dc] text-[#44534a] hover:bg-[#f8faf7]'
                      }`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center border text-xs font-semibold ${active ? 'border-[#24714f] bg-[#24714f] text-white' : 'border-[#cbd5cc] text-[#65716a]'}`}>
                        {isArabic ? ['أ', 'ب', 'ج', 'د'][index] : ['A', 'B', 'C', 'D'][index]}
                      </span>
                      <span>{option}</span>
                    </button>
                  )
                })}
              </div>
              {error && <p className="mt-4 border border-[#ead2cf] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}
            </div>
            <div className="border-t border-[#e6ebe5] p-5 sm:px-8">
              <button
                type="button"
                disabled={!selected || busy}
                onClick={() => void submitAnswer()}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : null}
                {questionNumber === TOTAL ? t('إرسال الإجابة والإنهاء', 'Submit and finish') : t('السؤال التالي', 'Next question')}
                {isArabic ? <ChevronLeft size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'speaking' && result) {
    const prompt = isArabic
      ? 'أريد تحسين لغتي الإنجليزية لأنها ستساعدني على تحقيق أهدافي.'
      : SPEAKING_PROMPT
    return (
      <main className="min-h-dvh bg-[#f5f7f3] px-4 py-8 sm:grid sm:place-items-center sm:px-6" dir={direction}>
        <section className="mx-auto w-full max-w-xl border border-[#dce4dc] bg-white p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <BrandLockup size="sm" />
            <LanguageToggle />
          </div>
          <p className="text-xs font-semibold text-[#24714f]">{t('الخطوة الأخيرة', 'FINAL STEP')}</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#202a25]">{t('أرسل عينة تحدث أو اطلب اجتماعاً', 'Share a speaking sample or request a meeting')}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5e6b62]">
            {t('يراجع فريق القبول إجابتك الصوتية لتأكيد التوصية. يمكنك بدلاً من ذلك طلب موعد لتقييم تحدث مباشر.', 'Our team reviews your spoken response to confirm the recommendation. You can request a live speaking assessment instead.')}
          </p>
          <div className="mt-5 border border-[#dce4dc] bg-[#f8faf7] p-4">
            <p className="text-xs font-semibold text-[#68746c]">{t('اقرأ هذه الجملة بصوت واضح', 'Read this sentence aloud')}</p>
            <p className="mt-2 text-base font-medium leading-7 text-[#27352d]">{prompt}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!recording ? (
              <button
                type="button"
                onClick={() => void startRecording()}
                disabled={busy}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-[#24714f] px-4 text-sm font-semibold text-[#1d5f42] hover:bg-[#f0f6f1] disabled:opacity-50"
              >
                <Mic size={17} aria-hidden="true" />
                {recordedBlob ? t('إعادة التسجيل', 'Record again') : t('بدء التسجيل', 'Start recording')}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#9b453b] px-4 text-sm font-semibold text-white hover:bg-[#853a32]"
              >
                <Square size={15} aria-hidden="true" />
                {t(`إيقاف التسجيل (${recordingDuration || 0}ث)`, `Stop recording (${recordingDuration || 0}s)`)}
              </button>
            )}
            <button
              type="button"
              disabled={busy || recording}
              onClick={() => void submitSpeaking('MEETING')}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-[#dce4dc] px-4 text-sm font-semibold text-[#44534a] hover:bg-[#f8faf7] disabled:opacity-50"
            >
              <CalendarDays size={17} aria-hidden="true" />
              {t('طلب موعد تقييم', 'Request a meeting')}
            </button>
          </div>
          {recordingUrl && (
            <div className="mt-4 border border-[#e3e9e3] p-3">
              <audio controls src={recordingUrl} className="w-full" aria-label={t('معاينة التسجيل', 'Recording preview')} />
              <p className="mt-2 text-xs text-[#68746c]">{t(`مدة التسجيل ${recordingDuration} ثانية`, `Recording duration: ${recordingDuration} seconds`)}</p>
            </div>
          )}
          {error && <p className="mt-4 border border-[#ead2cf] bg-[#fff8f6] px-3 py-3 text-sm leading-6 text-[#874039]" role="alert">{error}</p>}
          <button
            type="button"
            disabled={!recordedBlob || busy || recording}
            onClick={() => void submitSpeaking('RECORDING')}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#24714f] px-5 text-sm font-semibold text-white hover:bg-[#1d5f42] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Mic size={17} aria-hidden="true" />}
            {t('إرسال التسجيل للمراجعة', 'Send recording for review')}
          </button>
        </section>
      </main>
    )
  }

  if (phase === 'result' && result) {
    const info = LEVEL_INFO[result.level] || LEVEL_INFO.A1
    return (
      <main className="min-h-dvh bg-[#f5f7f3] px-4 py-8 sm:grid sm:place-items-center sm:px-6" dir={direction}>
        <section className="mx-auto w-full max-w-2xl border border-[#dce4dc] bg-white p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <BrandLockup size="sm" />
            <LanguageToggle />
          </div>
          <div className="border-b border-[#e5ebe4] pb-6 text-center">
            <p className="text-xs font-semibold text-[#24714f]">{t('نتيجة تقييمك', 'YOUR PLACEMENT RESULT')}</p>
            <div className="mt-2 text-4xl font-bold text-[#174c3c]">{result.band}</div>
            <h1 className="mt-2 text-2xl font-semibold text-[#202a25]">
              {t(info.label, info.labelEn)} · {result.level}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5e6b62]">{t(info.description, info.descriptionEn)}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-[#e3e9e3] bg-[#f8faf7] p-4 text-center">
              <p className="text-xs text-[#68746c]">{t('الإجابات الصحيحة', 'Correct answers')}</p>
              <p className="mt-1 text-2xl font-semibold text-[#202a25]">{result.score}/{result.total}</p>
            </div>
            <div className="border border-[#e3e9e3] bg-[#f8faf7] p-4 text-center">
              <p className="text-xs text-[#68746c]">{t('النتيجة', 'Score')}</p>
              <p className="mt-1 text-2xl font-semibold text-[#202a25]">{result.percentage}%</p>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-lg font-semibold text-[#202a25]">{t('اقتراحات تناسب مستواك', 'Suggestions for your level')}</h2>
            {result.recommendedPackages?.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {result.recommendedPackages.map((item) => (
                  <article key={item.id} className="border border-[#dce4dc] p-4">
                    <h3 className="font-semibold text-[#27352d]">{isArabic ? item.titleAr : item.title}</h3>
                    <p className="mt-2 text-sm text-[#5e6b62]">
                      {t(`${item.lessonsCount} درس`, `${item.lessonsCount} lessons`)}
                      {item.lessonsPerWeek ? ` · ${t(`${item.lessonsPerWeek} أسبوعياً`, `${item.lessonsPerWeek} per week`)}` : ''}
                    </p>
                    {item.subscriptionType && PACKAGE_FORMAT_LABELS[item.subscriptionType] && (
                      <p className="mt-1 text-xs text-[#68746c]">
                        {t('نوع الدراسة', 'Lesson format')}: {t(PACKAGE_FORMAT_LABELS[item.subscriptionType].ar, PACKAGE_FORMAT_LABELS[item.subscriptionType].en)}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-semibold text-[#24714f]">
                      {item.price} {item.currency || 'SAR'}
                    </p>
                    <Link
                      href={`/dashboard/student/checkout?packageId=${encodeURIComponent(item.id)}`}
                      className="mt-3 inline-flex min-h-10 items-center justify-center border border-[#24714f] px-3 text-sm font-semibold text-[#1d5f42] hover:bg-[#f0f6f1]"
                    >
                      {t('عرض الباقة', 'View package')}
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 border border-[#e3e9e3] bg-[#f8faf7] p-4 text-sm leading-6 text-[#5e6b62]">
                {t('سيعرض فريق القبول الباقات المناسبة بعد مراجعة نتيجة التحدث.', 'The admissions team will share suitable packages after reviewing your speaking response.')}
              </p>
            )}
          </div>

          <div className="mt-6 border border-[#dce4dc] bg-[#f8faf7] p-4">
            <p className="font-semibold text-[#27352d]">{t('استجابة التحدث', 'Speaking response')}</p>
            <p className="mt-1 text-sm leading-6 text-[#5e6b62]">
              {review?.mode === 'MEETING'
                ? t('تم إرسال طلب موعد تقييم التحدث لفريق القبول.', 'Your speaking assessment meeting request was sent to admissions.')
                : t('تم إرسال تسجيلك الصوتي للمراجعة من فريق القبول.', 'Your recording was sent to admissions for review.')}
            </p>
            {review?.status && <p className="mt-2 text-xs text-[#68746c]">{t('حالة الطلب', 'Request status')}: {review.status}</p>}
          </div>

          {fromRegistration ? (
            <div className="mt-6 border border-[#e3e9e3] p-4 text-sm leading-6 text-[#59665e]">
              {t('تم استلام تسجيلك. يراجع فريق القبول بيانات التسجيل وإيصال الدفع قبل تفعيل الحساب.', 'Your test is complete. Admissions will review your registration and payment receipt before activating your account.')}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {nextDestination ? (
              <button
                type="button"
                onClick={() => router.push(nextDestination)}
                className="min-h-12 flex-1 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42]"
              >
                {t('متابعة', 'Continue')}
              </button>
            ) : fromRegistration ? (
              <Link href="/auth/login" className="inline-flex min-h-12 flex-1 items-center justify-center bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42]">
                {t('تسجيل الدخول بعد التفعيل', 'Sign in after activation')}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/dashboard/student')}
                className="min-h-12 flex-1 bg-[#24714f] px-4 text-sm font-semibold text-white hover:bg-[#1d5f42]"
              >
                {t('لوحة الطالب', 'Student dashboard')}
              </button>
            )}
            <button
              type="button"
              onClick={startAgain}
              className="min-h-12 border border-[#dce4dc] px-4 text-sm font-semibold text-[#44534a] hover:bg-[#f8faf7]"
            >
              {t('إعادة الاختبار', 'Retake test')}
            </button>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center px-4 text-sm text-[#68746c] underline underline-offset-4">
              {t('الرئيسية', 'Home')}
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return null
}