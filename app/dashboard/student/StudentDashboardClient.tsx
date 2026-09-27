'use client'

import { useCallback, useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, BookOpen, Calendar, ChevronLeft, CreditCard, FileText, Home, Layers, LogOut, Medal, Menu, MessageSquare, Mic, ShoppingCart, Target, TrendingUp, UserRound, Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import HomeTab from './components/HomeTab'
import CertificatesTab from './components/CertificatesTab'
import SessionsTab from './components/SessionsTab'
import HomeworkTab from './components/HomeworkTab'
import PackagesTab from './components/PackagesTab'
import styles from './student-foundation.module.css'

interface StudentDashboardClientProps { user: { name: string; email: string; isActive: boolean } }
type MenuItem = { id: string; label: string; icon: typeof Home; href?: string; locked?: boolean }
type SubscriptionInfo = { status?: string }
type SubscriptionState = 'loading' | 'ready' | 'unavailable'

export default function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('loading')
  const [cartItemsCount, setCartItemsCount] = useState(0)

  const fetchCartCount = useCallback(async () => {
    try { const response = await fetch('/api/cart'); if (response.ok) { const data = await response.json(); setCartItemsCount(data.CartItem?.length || 0) } } catch (error) { console.error('Error fetching cart:', error) }
  }, [])
  const fetchSubscriptionStatus = useCallback(async () => {
    setSubscriptionState('loading')
    try {
      const response = await fetch('/api/student/subscription-status', { cache: 'no-store' })
      if (!response.ok) {
        setSubscriptionState('unavailable')
        return
      }
      const data = await response.json()
      if (!data || typeof data !== 'object' || ('error' in data && data.error)) {
        setSubscriptionState('unavailable')
        return
      }
      setHasSubscription(Boolean(data.hasApprovedSubscription))
      setSubscription(data.subscription || null)
      setSubscriptionState('ready')
    } catch {
      setSubscriptionState('unavailable')
    }
  }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCartCount()
      void fetchSubscriptionStatus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [fetchCartCount, fetchSubscriptionStatus])
  const primary: MenuItem[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'classes', label: 'حصصي', icon: Calendar, href: '/dashboard/student/classes' },
    { id: 'learning', label: 'التعلّم', icon: BookOpen, href: '/dashboard/student/learning' },
    { id: 'homework', label: 'الواجبات', icon: FileText, href: '/dashboard/student/homework' },
    { id: 'feedback', label: 'ملاحظات المدرس', icon: MessageSquare, href: '/dashboard/student/feedback' },
    { id: 'speaking', label: 'غرف المحادثة', icon: Mic, href: '/dashboard/student/speaking' },
    { id: 'goals', label: 'أهدافي', icon: Target, href: '/dashboard/student/learning?view=Goals' },
    { id: 'profile', label: 'الملف الشخصي', icon: UserRound, href: '/dashboard/student/profile' },
  ]
  const explore: MenuItem[] = [
    { id: 'sessions', label: 'الجلسات السابقة', icon: Video, locked: subscriptionState !== 'ready' || !hasSubscription },
    { id: 'legacy-homework', label: 'الواجبات السابقة', icon: FileText, locked: subscriptionState !== 'ready' || !hasSubscription },
    { id: 'certificates', label: 'الشهادات', icon: Award },
    { id: 'lessons', label: 'الدروس التعليمية', icon: BookOpen, href: '/dashboard/student/lessons' },
    { id: 'level', label: 'تقدم المستوى', icon: TrendingUp, href: '/dashboard/student/level-progress' },
    { id: 'vocabulary', label: 'المفردات', icon: Layers, href: '/dashboard/student/vocabulary' },
    { id: 'conversation', label: 'تدريب المحادثة', icon: Mic, href: '/dashboard/student/conversation-practice' },
    { id: 'packages', label: 'الباقات', icon: CreditCard },
    { id: 'achievements', label: 'الإنجازات السابقة', icon: Award, href: '/dashboard/student/achievements' },
    { id: 'leaderboard', label: 'لوحة الترتيب السابقة', icon: Medal, href: '/dashboard/student/leaderboard' },
  ]
  const selectItem = (item: MenuItem) => { if (item.locked) return; if (item.href) router.push(item.href); else setActiveTab(item.id); setSidebarOpen(false) }
  const handleSignOut = async () => { await signOut({ redirect: false }); router.push('/auth/login') }
  const renderMenu = (items: MenuItem[]) => items.map(item => {
    const Icon = item.icon
    return <button key={item.id} type="button" onClick={() => selectItem(item)} disabled={item.locked} aria-current={activeTab === item.id ? 'page' : undefined} className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}>
      <Icon size={17} aria-hidden="true" />
      <span>{item.label}</span>
      {item.locked && <span className="mr-auto text-[10px]">يتطلب اشتراكاً</span>}
    </button>
  })

  return <div dir="rtl">
    <header className={styles.topbar}><div className={styles.topbarInner}>
      <div className={styles.headerTools}><button aria-label="فتح القائمة" aria-expanded={sidebarOpen} aria-controls="student-navigation-panel" onClick={() => setSidebarOpen(true)} className={`${styles.mobileOnly} p-2`}><Menu size={21} aria-hidden="true" /></button><Link href="/" className={styles.brand}><span className={styles.brandMark}>ب</span><span>Be Fluent EDU</span></Link></div>
      <nav className={styles.desktopNav} aria-label="التنقل السريع"><Link href="/dashboard/student/classes">حصصي</Link><Link href="/dashboard/student/learning">التعلّم</Link><Link href="/dashboard/student/feedback">الملاحظات</Link></nav>
      <div className={styles.headerTools}><span className={styles.status}>{user.isActive ? 'حساب نشط' : 'قيد التفعيل'}</span><Link href="/dashboard/student/cart" aria-label="السلة" className="relative p-2"><ShoppingCart size={19}/>{cartItemsCount > 0 && <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 bg-[#0e4c3a] text-[#fffdf7] text-[11px] grid place-items-center rounded-full">{cartItemsCount}</span>}</Link><Button variant="outline" size="sm" onClick={handleSignOut} className="!border-[#d7ddd3] !rounded-none !text-[#20332c]"><LogOut size={15} className="ml-1" />خروج</Button></div>
    </div></header>
    {sidebarOpen && <button type="button" aria-label="إغلاق القائمة" className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />}
    <div className={styles.page}><div className={styles.shell}>
      <aside id="student-navigation-panel" aria-label="قائمة الطالب" className={`${styles.side} ${sidebarOpen ? styles.sideOpen : ''}`}>
        <button aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} className={`${styles.mobileOnly} absolute top-4 left-4 p-1`}><ChevronLeft size={20}/></button>
        <div className={styles.profile}><div className="flex items-center gap-3"><div className={styles.avatar} aria-hidden="true">{user.name?.charAt(0)}</div><div className="min-w-0"><p className="font-bold truncate">{user.name}</p><p className="text-xs text-[#6e776f] truncate">{user.email}</p></div></div></div>
        <nav id="student-primary-menu" aria-label="التنقل الرئيسي">
          <p className={styles.sectionLabel}>مساحتك التعليمية</p>{renderMenu(primary)}
        </nav>
        <nav aria-label="أدوات إضافية">
          <p className={styles.sectionLabel}>أدوات إضافية</p>{renderMenu(explore)}
        </nav>
      </aside>
      <main className={styles.surface}>
        {subscriptionState === 'unavailable' && (
          <div role="alert" className={styles.notice}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong>تعذر التحقق من حالة الاشتراك</strong>
                <p className="mt-1">ستبقى الأدوات المقيدة مغلقة حتى نتمكن من التحقق من حالتك.</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchSubscriptionStatus()}
                className="min-h-11 shrink-0 rounded border border-[#d7c99c] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3a70]"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}
        {!user.isActive && subscriptionState === 'ready' && <div className={styles.notice}><strong>{subscription?.status === 'PENDING' ? 'طلبك قيد المراجعة' : 'حسابك غير مفعّل'}</strong><span className="mr-2">اختر باقة وأكمل خطوات الاشتراك للوصول إلى جميع أدوات التعلم.</span></div>}
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'sessions' && <SessionsTab isActive={user.isActive} />}
        {activeTab === 'certificates' && <CertificatesTab />}
        {activeTab === 'legacy-homework' && <HomeworkTab isActive={user.isActive} />}
        {activeTab === 'packages' && <PackagesTab isActive={user.isActive} onCartUpdate={fetchCartCount} />}
      </main>
    </div></div>
  </div>
}