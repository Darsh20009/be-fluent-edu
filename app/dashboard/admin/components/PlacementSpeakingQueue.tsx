'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText, localeDirection } from '@/lib/locale'

type ReviewItem = {
  id: string
  attemptId: string
  mode: 'RECORDING' | 'MEETING'
  status: string
  reviewNotes: string | null
  meetingAt: string | null
  recordingUrl: string | null
  createdAt: string
  student: { id: string; name: string; email: string; phone: string | null }
}

const REVIEW_STATUSES = ['PENDING', 'MEETING_REQUESTED', 'IN_REVIEW', 'REVIEWED', 'MEETING_SCHEDULED', 'CLOSED']

export default function PlacementSpeakingQueue() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [status, setStatus] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [meetingTimes, setMeetingTimes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    fetch(`/api/admin/placement-speaking${query}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to load speaking reviews.')
        if (!active) return
        const nextItems = Array.isArray(data.items) ? data.items as ReviewItem[] : []
        setItems(nextItems)
        setNotes(Object.fromEntries(nextItems.map((item) => [item.id, item.reviewNotes || ''])))
        setMeetingTimes(Object.fromEntries(nextItems.map((item) => [
          item.id,
          item.meetingAt ? new Date(item.meetingAt).toISOString().slice(0, 16) : '',
        ])))
        setError('')
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Failed to load speaking reviews.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [refreshVersion, status])

  const updateReview = async (item: ReviewItem, nextStatus: 'IN_REVIEW' | 'REVIEWED' | 'MEETING_SCHEDULED' | 'CLOSED') => {
    setSavingId(item.id)
    setError('')
    setNotice('')
    try {
      const meetingAt = meetingTimes[item.id]
      const response = await fetch('/api/admin/placement-speaking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: item.id,
          status: nextStatus,
          reviewNotes: notes[item.id] || '',
          ...(nextStatus === 'MEETING_SCHEDULED' ? { meetingAt: new Date(meetingAt).toISOString() } : {}),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not update this request.')
      setItems((current) => current.map((entry) => entry.id === item.id
        ? { ...entry, status: data.status, reviewNotes: data.reviewNotes, meetingAt: data.meetingAt }
        : entry))
      setNotice(t('تم تحديث طلب التحدث.', 'Speaking request updated.'))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update this request.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-4 sm:p-6" dir={localeDirection(language)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('مراجعة التحدث وطلبات المواعيد', 'Speaking review and meeting requests')}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">{t('استمع إلى التسجيلات، أضف الملاحظات، وجدول موعداً عند الحاجة.', 'Listen to recordings, add notes, and schedule a meeting when needed.')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="speaking-review-status">{t('تصفية حسب الحالة', 'Filter by status')}</label>
          <select
            id="speaking-review-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="min-h-10 border border-gray-300 bg-white px-2 text-sm"
          >
            <option value="">{t('كل الطلبات', 'All requests')}</option>
            {REVIEW_STATUSES.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <button
            type="button"
            onClick={() => setRefreshVersion((current) => current + 1)}
            className="grid h-10 w-10 place-items-center border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label={t('تحديث القائمة', 'Refresh list')}
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      {notice && <p className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800" role="status">{notice}</p>}
      {loading ? (
        <div className="flex min-h-24 items-center justify-center"><LoaderCircle className="animate-spin text-emerald-700" size={22} aria-label={t('جارٍ التحميل', 'Loading')} /></div>
      ) : items.length ? (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="border border-gray-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{item.student.name}</p>
                  <p className="mt-1 text-xs text-gray-600">{item.student.email}{item.student.phone ? ` · ${item.student.phone}` : ''}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.mode === 'RECORDING' ? t('تسجيل صوتي', 'Audio recording') : t('طلب موعد', 'Meeting request')}
                    {' · '}{new Date(item.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    {' · '}{item.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{t('الاختبار', 'Attempt')}: {item.attemptId.slice(0, 8)}</span>
              </div>

              {item.recordingUrl && (
                <audio
                  controls
                  preload="none"
                  src={item.recordingUrl}
                  className="mt-3 w-full max-w-xl"
                  aria-label={t(`تسجيل ${item.student.name}`, `Recording from ${item.student.name}`)}
                />
              )}

              <label className="mt-4 block text-xs font-semibold text-gray-700" htmlFor={`review-notes-${item.id}`}>
                {t('ملاحظات المراجعة', 'Review notes')}
              </label>
              <textarea
                id={`review-notes-${item.id}`}
                value={notes[item.id] || ''}
                onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                maxLength={3000}
                rows={2}
                className="mt-1 w-full border border-gray-300 p-2 text-sm outline-none focus:border-emerald-700"
              />

              {item.mode === 'MEETING' && (
                <label className="mt-3 block text-xs font-semibold text-gray-700" htmlFor={`meeting-time-${item.id}`}>
                  {t('موعد التقييم', 'Assessment meeting time')}
                  <input
                    id={`meeting-time-${item.id}`}
                    type="datetime-local"
                    value={meetingTimes[item.id] || ''}
                    onChange={(event) => setMeetingTimes((current) => ({ ...current, [item.id]: event.target.value }))}
                    className="mt-1 block min-h-10 w-full border border-gray-300 px-2 text-sm sm:max-w-sm"
                  />
                </label>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {item.status !== 'IN_REVIEW' && item.status !== 'CLOSED' && (
                  <button
                    type="button"
                    disabled={savingId === item.id}
                    onClick={() => void updateReview(item, 'IN_REVIEW')}
                    className="min-h-10 border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t('بدء المراجعة', 'Start review')}
                  </button>
                )}
                {item.mode === 'RECORDING' && item.status !== 'REVIEWED' && item.status !== 'CLOSED' && (
                  <button
                    type="button"
                    disabled={savingId === item.id}
                    onClick={() => void updateReview(item, 'REVIEWED')}
                    className="min-h-10 bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {t('إنهاء المراجعة', 'Complete review')}
                  </button>
                )}
                {item.mode === 'MEETING' && item.status !== 'MEETING_SCHEDULED' && item.status !== 'CLOSED' && (
                  <button
                    type="button"
                    disabled={savingId === item.id || !meetingTimes[item.id]}
                    onClick={() => void updateReview(item, 'MEETING_SCHEDULED')}
                    className="min-h-10 bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {t('تأكيد الموعد', 'Schedule meeting')}
                  </button>
                )}
                {item.status !== 'CLOSED' && (
                  <button
                    type="button"
                    disabled={savingId === item.id}
                    onClick={() => void updateReview(item, 'CLOSED')}
                    className="min-h-10 px-3 text-xs font-semibold text-gray-600 underline underline-offset-4 disabled:opacity-50"
                  >
                    {t('إغلاق الطلب', 'Close request')}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">{t('لا توجد طلبات في هذه القائمة.', 'No requests in this list.')}</p>
      )}
    </section>
  )
}