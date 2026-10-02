'use client'

import { useState, type FormEvent } from 'react'
import { Check, LoaderCircle, UserPlus } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'

export default function EmployeeAccountForm() {
  const { language } = useTheme()
  const t = (ar: string, en: string) => localeText(language, ar, en)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    role: 'TEACHER' as 'TEACHER' | 'STAFF',
  })
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setFeedback(null)
    try {
      const response = await fetch('/api/admin/people/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      const result: unknown = await response.json().catch(() => null)
      const data = result && typeof result === 'object'
        ? result as { ok?: unknown; error?: { code?: unknown }; employee?: { name?: unknown; email?: unknown; role?: unknown } }
        : null
      if (!response.ok || data?.ok !== true) {
        const code = data?.error?.code
        const message = code === 'EMAIL_IN_USE'
          ? t('هذا البريد الإلكتروني مستخدم بالفعل.', 'That email address is already in use.')
          : code === 'INVALID_EMPLOYEE'
            ? t('تحقق من الحقول المطلوبة. يجب أن تتكون كلمة المرور من 12 حرفاً على الأقل.', 'Check the required fields. Passwords must be at least 12 characters.')
            : code === 'FORBIDDEN'
              ? t('ليس لديك صلاحية إنشاء هذا الحساب.', 'You are not allowed to create this account.')
              : t('تعذر إنشاء الحساب الآن. لم تُرسل أي دعوة.', 'The account could not be created. No invitation was sent.')
        setFeedback({ kind: 'error', text: message })
        return
      }
      setFeedback({
        kind: 'success',
        text: t(`تم إنشاء حساب ${form.role === 'TEACHER' ? 'المعلم' : 'الموظف'} بنجاح.`, `${form.role === 'TEACHER' ? 'Teacher' : 'Staff'} account created successfully.`),
      })
      setForm({ name: '', email: '', password: '', phone: '', bio: '', role: 'TEACHER' })
    } catch {
      setFeedback({ kind: 'error', text: t('تعذر الاتصال بالنظام. احتفظ بالبيانات وحاول مجدداً.', 'The system could not be reached. Your form data is still here; please try again.') })
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setFeedback(null)
  }

  return (
    <section className="max-w-3xl rounded-xl border border-[#dce5de] bg-white p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#edf5ef] text-[#24714f]">
          <UserPlus size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[#26332e]">{t('إنشاء حساب موظف', 'Create an employee account')}</h2>
          <p className="mt-1 text-sm leading-6 text-[#68756e]">
            {t('يمكنك إنشاء حساب معلم أو موظف. لا يمكن إنشاء حساب مدير أو تعيين صلاحيات من هذه الصفحة.', 'Create a teacher or staff account. This page cannot create administrators or assign permissions.')}
          </p>
        </div>
      </div>

      <form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-semibold text-[#344239]">
          <span>{t('نوع الحساب', 'Account type')}</span>
          <select
            value={form.role}
            onChange={(event) => update('role', event.target.value)}
            className="min-h-11 w-full rounded-lg border border-[#dce4dc] bg-white px-3 font-normal outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15"
          >
            <option value="TEACHER">{t('معلم', 'Teacher')}</option>
            <option value="STAFF">{t('موظف', 'Staff')}</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#344239]">
          <span>{t('الاسم الكامل', 'Full name')}</span>
          <input value={form.name} onChange={(event) => update('name', event.target.value)} required minLength={2} maxLength={120} autoComplete="name" className="min-h-11 w-full rounded-lg border border-[#dce4dc] px-3 font-normal outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15" />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#344239]">
          <span>{t('البريد الإلكتروني', 'Email address')}</span>
          <input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required maxLength={254} autoComplete="email" dir="ltr" className="min-h-11 w-full rounded-lg border border-[#dce4dc] px-3 text-start font-normal outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15" />
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#344239]">
          <span>{t('كلمة المرور', 'Password')}</span>
          <input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required minLength={12} maxLength={72} autoComplete="new-password" dir="ltr" className="min-h-11 w-full rounded-lg border border-[#dce4dc] px-3 text-start font-normal outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15" />
          <span className="block text-xs font-normal leading-5 text-[#718078]">{t('12 حرفاً على الأقل. لا تشارك كلمة المرور في المحادثة.', 'At least 12 characters. Do not share the password in chat.')}</span>
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#344239]">
          <span>{t('رقم الهاتف (اختياري)', 'Phone (optional)')}</span>
          <input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} maxLength={32} autoComplete="tel" dir="ltr" className="min-h-11 w-full rounded-lg border border-[#dce4dc] px-3 text-start font-normal outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15" />
        </label>
        {form.role === 'TEACHER' && (
          <label className="space-y-1.5 text-sm font-semibold text-[#344239] sm:col-span-2">
            <span>{t('نبذة المعلم (اختياري)', 'Teacher bio (optional)')}</span>
            <textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} maxLength={1000} rows={3} className="w-full resize-y rounded-lg border border-[#dce4dc] px-3 py-2 font-normal leading-6 outline-none focus:border-[#24714f] focus:ring-2 focus:ring-[#24714f]/15" />
          </label>
        )}
        <div className="sm:col-span-2">
          <button type="submit" disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#24714f] px-5 text-sm font-bold text-white hover:bg-[#19583f] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
            {saving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
            {saving ? t('جارٍ إنشاء الحساب…', 'Creating account…') : t('إنشاء الحساب', 'Create account')}
          </button>
          {feedback && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-sm leading-6 ${feedback.kind === 'success' ? 'bg-[#edf5ef] text-[#246448]' : 'bg-[#fff8f6] text-[#874039]'}`} role={feedback.kind === 'success' ? 'status' : 'alert'}>
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}