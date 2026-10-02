'use client'

import { useCallback, useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, BookOpen, Calendar, ChevronLeft, CreditCard, FileText, Home, Layers, LogOut, Medal, Menu, MessageSquare, Mic, ShoppingCart, Target, TrendingUp, UserRound, Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import BrandLockup from '@/components/brand/BrandLockup'
import ThemeToggle from '@/components/ThemeToggle'
import HomeTab from './components/RedesignedHomeTab'
import CertificatesTab from './components/CertificatesTab'
import SessionsTab from './components/SessionsTab'
import HomeworkTab from './components/HomeworkTab'
import PackagesTab from './components/PackagesTab'
import styles from './student-foundation.module.css'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeDirection, localeText } from '@/lib/locale'

interface StudentDashboardClientProps { user: { name: string; email: string; isActive: boolean } }
type MenuItem = { id: string; label: string; icon: typeof Home; href?: string; locked?: boolean }
type SubscriptionInfo = { status?: string }
type SubscriptionState = 'loading' | 'ready' | 'unavailable'

export default function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const router = useRouter()
  const { language } = useTheme()
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
    { id: 'home', label: localeText(language, 'الرئيسية', 'Home'), icon: Home },
    { id: 'classes', label: localeText(language, 'حصصي', 'My classes'), icon: Calendar, href: '/dashboard/student/classes' },
    { id: 'learning', label: localeText(language, 'التعلّم', 'Learning'), icon: BookOpen, href: '/dashboard/student/learning' },
    { id: 'homework', label: localeText(language, 'الواجبات', 'Homework'), icon: FileText, href: '/dashboard/student/homework' },
    { id: 'feedback', label: localeText(language, 'ملاحظات المدرس', 'Teacher feedback'), icon: MessageSquare, href: '/dashboard/student/feedback' },
    { id: 'speaking', label: localeText(language, 'غرف المحادثة', 'Conversation rooms'), icon: Mic, href: '/dashboard/student/speaking' },
    { id: 'goals', label: localeText(language, 'أهدافي', 'My goals'), icon: Target, href: '/dashboard/student/learning?view=Goals' },
    { id: 'profile', label: localeText(language, 'الملف الشخصي', 'Profile'), icon: UserRound, href: '/dashboard/student/profile' },
  ]
  const explore: MenuItem[] = [
    { id: 'sessions', label: localeText(language, 'الجلسات السابقة', 'Past sessions'), icon: Video, locked: subscriptionState !== 'ready' || !hasSubscription },
    { id: 'legacy-homework', label: localeText(language, 'الواجبات السابقة', 'Past homework'), icon: FileText, locked: subscriptionState !== 'ready' || !hasSubscription },
    { id: 'certificates', label: localeText(language, 'الشهادات', 'Certificates'), icon: Award },
    { id: 'lessons', label: localeText(language, 'الدروس التعليمية', 'Lessons'), icon: BookOpen, href: '/dashboard/student/lessons' },
    { id: 'level', label: localeText(language, 'تقدم المستوى', 'Level progress'), icon: TrendingUp, href: '/dashboard/student/level-progress' },
    { id: 'vocabulary', label: localeText(language, 'المفردات', 'Vocabulary'), icon: Layers, href: '/dashboard/student/vocabulary' },
    { id: 'conversation', label: localeText(language, 'تدريب المحادثة', 'Conversation practice'), icon: Mic, href: '/dashboard/student/conversation-practice' },
    { id: 'packages', label: localeText(language, 'الباقات', 'Packages'), icon: CreditCard },
    { id: 'achievements', label: localeText(language, 'الإنجازات السابقة', 'Achievements'), icon: Award, href: '/dashboard/student/achievements' },
    { id: 'leaderboard', label: localeText(language, 'لوحة الترتيب السابقة', 'Leaderboard'), icon: Medal, href: '/dashboard/student/leaderboard' },
  ]
  const selectItem = (item: MenuItem) => { if (item.locked) return; if (item.href) router.push(item.href); else setActiveTab(item.id); setSidebarOpen(false) }
  const handleSignOut = async () => { await signOut({ redirect: false }); router.push('/auth/login') }
  const renderMenu = (items: MenuItem[]) => items.map(item => {
    const Icon = item.icon
    return <button key={item.id} type="button" onClick={() => selectItem(item)} disabled={item.locked} aria-current={activeTab === item.id ? 'page' : undefined} className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}>
      <Icon size={17} aria-hidden="true" />
      <span>{item.label}</span>
      {item.locked && <span className="mr-auto text-[10px]">{localeText(language, 'يتطلب اشتراكاً', 'Subscription required')}</span>}
    </button>
  })

  return <div className={styles.foundation} dir={localeDirection(language)}>
    <header className={styles.topbar}><div className={styles.topbarInner}>
      <div className={styles.headerTools}><button type="button" aria-label={localeText(language, 'فتح القائمة', 'Open menu')} aria-expanded={sidebarOpen} aria-controls="student-navigation-panel" onClick={() => setSidebarOpen(true)} className={styles.mobileOnly}><Menu size={21} aria-hidden="true" /></button><Link href="/" className={styles.brand} aria-label="Be Fluent home"><BrandLockup size="xs" /></Link></div>
      <nav className={styles.desktopNav} aria-label={localeText(language, 'التنقل السريع', 'Quick navigation')}><Link href="/dashboard/student/classes">{localeText(language, 'حصصي', 'My classes')}</Link><Link href="/dashboard/student/learning">{localeText(language, 'التعلّم', 'Learning')}</Link><Link href="/dashboard/student/feedback">{localeText(language, 'الملاحظات', 'Feedback')}</Link></nav>
      <div className={styles.headerTools}><ThemeToggle /><span className={styles.status}>{user.isActive ? localeText(language, 'حساب نشط', 'Active account') : localeText(language, 'قيد التفعيل', 'Activation pending')}</span><Link href="/dashboard/student/cart" aria-label={localeText(language, 'السلة', 'Cart')} className="relative grid min-h-11 min-w-11 place-items-center rounded-lg text-[#496257] hover:bg-[#f2f7f2]"><ShoppingCart size={19} aria-hidden="true" />{cartItemsCount > 0 && <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 bg-[#247456] text-white text-[11px] grid place-items-center rounded-full">{cartItemsCount}</span>}</Link><Button variant="outline" size="sm" onClick={handleSignOut} className="!min-h-11 !border-[#d7e1d8] !rounded-lg !text-[#315f49]"><LogOut size={15} className="ml-1" />{localeText(language, 'خروج', 'Sign out')}</Button></div>
    </div></header>
    {sidebarOpen && <button type="button" aria-label={localeText(language, 'إغلاق القائمة', 'Close menu')} className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />}
    <div className={styles.page}><div className={styles.shell}>
      <aside id="student-navigation-panel" aria-label={localeText(language, 'قائمة الطالب', 'Student navigation')} className={`${styles.side} ${sidebarOpen ? styles.sideOpen : ''}`}>
        <button type="button" aria-label={localeText(language, 'إغلاق القائمة', 'Close menu')} onClick={() => setSidebarOpen(false)} className={`${styles.mobileOnly} absolute top-3 left-3`}><ChevronLeft size={20}/></button>
        <div className={styles.profile}><div className="flex items-center gap-3"><div className={styles.avatar} aria-hidden="true">{user.name?.charAt(0)}</div><div className="min-w-0"><p className="font-bold truncate">{user.name}</p><p className="text-xs text-[#6e776f] truncate">{user.email}</p></div></div></div>
        <nav id="student-primary-menu" aria-label={localeText(language, 'التنقل الرئيسي', 'Main navigation')}>
          <p className={styles.sectionLabel}>{localeText(language, 'مساحتك التعليمية', 'Your learning space')}</p>{renderMenu(primary)}
        </nav>
        <nav aria-label={localeText(language, 'أدوات إضافية', 'Additional tools')}>
          <p className={styles.sectionLabel}>{localeText(language, 'أدوات إضافية', 'More tools')}</p>{renderMenu(explore)}
        </nav>
      </aside>
      <main className={styles.surface}>
        {subscriptionState === 'unavailable' && (
          <div role="alert" className={styles.notice}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <strong>{localeText(language, 'تعذر التحقق من حالة الاشتراك', 'Unable to verify subscription status')}</strong>
                <p className="mt-1">{localeText(language, 'ستبقى الأدوات المقيدة مغلقة حتى نتمكن من التحقق من حالتك.', 'Restricted tools will stay locked until we can verify your status.')}</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchSubscriptionStatus()}
                className="min-h-11 shrink-0 rounded border border-[#d7c99c] px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b3a70]"
              >
                {localeText(language, 'إعادة المحاولة', 'Try again')}
              </button>
            </div>
          </div>
        )}
        {!user.isActive && subscriptionState === 'ready' && <div className={styles.notice}><strong>{subscription?.status === 'PENDING' ? localeText(language, 'طلبك قيد المراجعة', 'Your request is under review') : localeText(language, 'حسابك غير مفعّل', 'Your account is not active')}</strong><span className="mr-2">{localeText(language, 'اختر باقة وأكمل خطوات الاشتراك للوصول إلى جميع أدوات التعلم.', 'Choose a package and complete the subscription steps to access all learning tools.')}</span></div>}
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'sessions' && <SessionsTab isActive={user.isActive} />}
        {activeTab === 'certificates' && <CertificatesTab />}
        {activeTab === 'legacy-homework' && <HomeworkTab isActive={user.isActive} />}
        {activeTab === 'packages' && <PackagesTab isActive={user.isActive} onCartUpdate={fetchCartCount} />}
      </main>
    </div></div>
  </div>
}