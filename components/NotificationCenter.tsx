'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'
import { safeLocalNotificationHref } from '@/lib/notifications/view'

type NotificationItem = {
  id: string
  eventType: string
  title: string | null
  body: string | null
  titleAr: string | null
  bodyAr: string | null
  href: string | null
  readAt: string | null
  createdAt: string
}

function eventTitle(eventType: string, language: string) {
  const titles: Record<string, [string, string]> = {
    'feedback.published': ['تم نشر ملاحظات الحصة', 'Class feedback published'],
    'homework.assigned': ['تم تعيين واجب جديد', 'New homework assigned'],
    'homework.reviewed': ['تمت مراجعة واجبك', 'Homework reviewed'],
    'subscription.approved': ['تم اعتماد اشتراكك', 'Subscription approved'],
    'group.proposal': ['لديك اقتراح مجموعة للمراجعة', 'A group proposal is ready'],
    'group.assigned': ['تم تأكيد تعيين مجموعتك', 'Your group assignment is confirmed'],
    'learning.daily.ready': ['خطة تعلم اليوم جاهزة', 'Today’s learning plan is ready'],
  }
  const pair = titles[eventType]
  return pair ? (language === 'ar' ? pair[0] : pair[1]) : eventType
}

export default function NotificationCenter() {
  const router = useRouter()
  const { language } = useTheme()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const t = (ar: string, en: string) => localeText(language, ar, en)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/notifications', { cache: 'no-store' })
        if (!response.ok) throw new Error('Notification request failed')
        const data = await response.json()
        if (!active) return
        setItems(Array.isArray(data.items) ? data.items : [])
        setUnreadCount(Number.isFinite(data.unreadCount) ? data.unreadCount : 0)
        setError(false)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load()
    }, 30_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refreshKey])

  async function markRead(id: string) {
    const response = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' })
    if (!response.ok) throw new Error('Could not mark notification as read')
    setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
    setUnreadCount((count) => Math.max(0, count - 1))
  }

  async function openItem(item: NotificationItem) {
    try {
      if (!item.readAt) await markRead(item.id)
      const href = safeLocalNotificationHref(item.href)
      setOpen(false)
      if (href) router.push(href)
    } catch {
      setError(true)
    }
  }

  async function markAllRead() {
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (!response.ok) throw new Error('Could not mark notifications as read')
      const timestamp = new Date().toISOString()
      setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || timestamp })))
      setUnreadCount(0)
    } catch {
      setError(true)
    }
  }

  return (
    <div className="relative" dir={localeDirection(language)}>
      <button
        type="button"
        aria-label={t(`الإشعارات${unreadCount ? `، ${unreadCount} غير مقروءة` : ''}`, `Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`)}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => { if (!open) setRefreshKey((value) => value + 1); setOpen((value) => !value); setError(false) }}
        className="relative grid h-11 w-11 place-items-center rounded-lg border border-[#d7e1d8] text-[#315f49] hover:bg-[#f2f7f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#286547]"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-[#b4473b] text-[10px] font-bold leading-4 text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && (
        <section role="dialog" aria-label={t('مركز الإشعارات', 'Notification center')} className="absolute end-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-lg">
          <header className="flex items-center justify-between gap-3 border-b border-[#e8ece8] px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-[#26332e]">{t('الإشعارات', 'Notifications')}</h2>
              <p className="mt-0.5 text-xs text-[#718078]">{t(`${unreadCount} غير مقروء`, `${unreadCount} unread`)}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button type="button" onClick={() => void markAllRead()} aria-label={t('تحديد الكل كمقروء', 'Mark all as read')} className="grid h-10 w-10 place-items-center rounded-lg text-[#315f49] hover:bg-[#f2f7f2]">
                  <CheckCheck size={17} aria-hidden="true" />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label={t('إغلاق الإشعارات', 'Close notifications')} className="grid h-10 w-10 place-items-center rounded-lg text-[#718078] hover:bg-[#f2f7f2]">
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          </header>
          {error && <p role="alert" className="px-4 py-3 text-xs text-red-700">{t('تعذر تحديث الإشعارات. أعد المحاولة.', 'Could not refresh notifications. Try again.')}</p>}
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-[#718078]">{t('جارٍ التحميل…', 'Loading…')}</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#718078]">{t('لا توجد إشعارات حتى الآن.', 'No notifications yet.')}</p>
          ) : (
            <ul className="max-h-[min(65vh,480px)] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="border-b border-[#eef1ee] last:border-b-0">
                  <button type="button" onClick={() => void openItem(item)} className={`w-full px-4 py-3 text-start hover:bg-[#f6f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#286547] ${item.readAt ? '' : 'bg-[#f2f7f2]'}`}>
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#26332e]">{language === 'ar' ? item.titleAr || eventTitle(item.eventType, language) : item.title || eventTitle(item.eventType, language)}</span>
                        {(language === 'ar' ? item.bodyAr || item.body : item.body) && <span className="mt-1 block text-xs leading-5 text-[#5c6961]">{language === 'ar' ? item.bodyAr || item.body : item.body}</span>}
                        <time className="mt-2 block text-[11px] text-[#849087]" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US')}</time>
                      </span>
                      {!item.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#247456]" aria-label={t('غير مقروء', 'Unread')} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <button type="button" onClick={() => { setLoading(true); setRefreshKey((value) => value + 1) }} className="min-h-11 w-full border-t border-[#e8ece8] px-4 text-sm font-semibold text-[#286547]">{t('إعادة المحاولة', 'Retry')}</button>}
        </section>
      )}
    </div>
  )
}