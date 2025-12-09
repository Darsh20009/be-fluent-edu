'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const DAYS = [
  { value: 0, label: 'Sunday / الأحد' },
  { value: 1, label: 'Monday / الاثنين' },
  { value: 2, label: 'Tuesday / الثلاثاء' },
  { value: 3, label: 'Wednesday / الأربعاء' },
  { value: 4, label: 'Thursday / الخميس' },
  { value: 5, label: 'Friday / الجمعة' },
  { value: 6, label: 'Saturday / السبت' }
]

export default function ScheduleSessionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId')

  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [lessonsPerWeek, setLessonsPerWeek] = useState(2)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!subscriptionId) {
      router.push('/dashboard/student')
    }
  }, [subscriptionId, router])

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      setError('Please select at least one day')
      return
    }

    if (lessonsPerWeek <= 0) {
      setError('Lessons per week must be at least 1')
      return
    }

    if (lessonsPerWeek > selectedDays.length) {
      setError(`Cannot schedule ${lessonsPerWeek} lessons per week with only ${selectedDays.length} selected days`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/student/schedule-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          preferredDays: selectedDays,
          lessonsPerWeek
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule sessions')
      }

      const data = await response.json()
      setSuccess(true)

      setTimeout(() => {
        router.push('/dashboard/student')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!subscriptionId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card variant="elevated" className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">تم بنجاح! / Success!</h2>
          <p className="text-neutral-700 dark:text-neutral-300 mb-4">
            تم جدولة الحصص الخاصة بك بنجاح
          </p>
          <p className="text-sm text-neutral-500">
            جاري إعادة التوجيه...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-300 mb-2">
          Schedule Your Sessions / جدول حصصك
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          اختر الأيام المفضلة وعدد الحصص في الأسبوع
        </p>
      </div>

      {error && <Alert variant="error"><p>{error}</p></Alert>}

      <Card variant="elevated" className="space-y-6">
        {/* Days Selection */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            <Calendar className="inline h-5 w-5 mr-2" />
            Select Preferred Days / اختر الأيام المفضلة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map(day => (
              <button
                key={day.value}
                onClick={() => handleDayToggle(day.value)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedDays.includes(day.value)
                    ? 'border-primary-500 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-300'
                }`}
              >
                <CheckCircle className={`inline h-4 w-4 mr-2 ${selectedDays.includes(day.value) ? '' : 'opacity-30'}`} />
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Per Week */}
        <div className="border-t border-neutral-300 dark:border-neutral-600 pt-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            <Clock className="inline h-5 w-5 mr-2" />
            Lessons Per Week / الحصص في الأسبوع
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLessonsPerWeek(Math.max(1, lessonsPerWeek - 1))}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100"
              disabled={lessonsPerWeek <= 1}
            >
              −
            </button>
            <div className="flex-1">
              <input
                type="number"
                value={lessonsPerWeek}
                onChange={e => setLessonsPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-center text-lg font-semibold"
                min="1"
              />
            </div>
            <button
              onClick={() => setLessonsPerWeek(lessonsPerWeek + 1)}
              className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100"
            >
              +
            </button>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            {selectedDays.length > 0
              ? `مع ${selectedDays.length} أيام مختارة، يمكنك جدولة حتى ${selectedDays.length} حصة في الأسبوع`
              : 'اختر الأيام أولاً'}
          </p>
        </div>
      </Card>

      {/* Summary */}
      {selectedDays.length > 0 && (
        <Card variant="elevated" className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">ملخص / Summary</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ أيام الحصص: {selectedDays.map(d => DAYS.find(day => day.value === d)?.label.split(' ')[0]).join(', ')}</li>
            <li>✅ الحصص في الأسبوع: {lessonsPerWeek}</li>
            <li>✅ سيتم التنسيق مع المعلم للأوقات المحددة</li>
          </ul>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || selectedDays.length === 0}
          className="flex-1"
        >
          {loading ? 'جاري الجدولة...' : 'تأكيد الجدولة / Confirm Schedule'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push('/dashboard/student')}
          disabled={loading}
        >
          إلغاء / Cancel
        </Button>
      </div>
    </div>
  )
}
