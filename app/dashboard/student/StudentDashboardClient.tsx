'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Award, BookOpen, Calendar, ChevronLeft, CreditCard, FileText, Home, Layers, LogOut, Medal, Menu, Mic, ShoppingCart, TrendingUp, Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import HomeTab from './components/HomeTab'
import CertificatesTab from './components/CertificatesTab'
import SessionsTab from './components/SessionsTab'
import HomeworkTab from './components/HomeworkTab'
import PackagesTab from './components/PackagesTab'
import styles from './student-foundation.module.css'

interface StudentDashboardClientProps { user: { name: string; email: string; isActive: boolean } }
type MenuItem = { id: string; label: string; icon: typeof Home; href?: string; locked?: boolean }

export default function StudentDashboardClient({ user }: StudentDashboardClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [cartItemsCount, setCartItemsCount] = useState(0)

  const fetchCartCount = async () => {
    try { const response = await fetch('/api/cart'); if (response.ok) { const data = await response.json(); setCartItemsCount(data.CartItem?.length || 0) } } catch (error) { console.error('Error fetching cart:', error) }
  }
  useEffect(() => {
    fetchCartCount()
    fetch('/api/student/subscription-status').then(r => r.ok ? r.json() : null).then(data => { if (data) { setHasSubscription(data.hasApprovedSubscription); setSubscription(data.subscription) } }).catch(error => console.error('Error checking subscription:', error))
  }, [])
  const primary: MenuItem[] = [
    { id: 'home', label: 'الرئيسية', icon: Home }, { id: 'certificates', label: 'شهاداتي', icon: Award },
    { id: 'sessions', label: 'الحصص المباشرة', icon: Video, locked: !hasSubscription }, { id: 'lessons', label: 'الدروس التعليمية', icon: BookOpen, href: '/dashboard/student/lessons' },
    { id: 'homework', label: 'الواجبات اليومية', icon: FileText, locked: !hasSubscription },
  ]
  const explore: MenuItem[] = [
    { id: 'level', label: 'تقدم المستوى', icon: TrendingUp, href: '/dashboard/student/level-progress' }, { id: 'vocabulary', label: 'المفردات', icon: Layers, href: '/dashboard/student/vocabulary' },
    { id: 'conversation', label: 'تدريب المحادثة', icon: Mic, href: '/dashboard/student/conversation-practice' }, { id: 'achievements', label: 'الإنجازات', icon: Award, href: '/dashboard/student/achievements' },
    { id: 'leaderboard', label: 'المتصدرون', icon: Medal, href: '/dashboard/student/leaderboard' }, { id: 'packages', label: 'الباقات', icon: CreditCard },
  ]
  const selectItem = (item: MenuItem) => { if (item.locked) return; if (item.href) router.push(item.href); else setActiveTab(item.id); setSidebarOpen(false) }
  const handleSignOut = async () => { await signOut({ redirect: false }); router.push('/auth/login') }
  const renderMenu = (items: MenuItem[]) => items.map(item => { const Icon = item.icon; return <button key={item.id} onClick={() => selectItem(item)} disabled={item.locked} className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}><Icon size={17} /><span>{item.label}</span>{item.locked && <span className="mr-auto text-[10px]">يتطلب اشتراكاً</span>}</button> })

  return <div dir="rtl">
    <header className={styles.topbar}><div className={styles.topbarInner}>
      <div className={styles.headerTools}><button aria-label="فتح القائمة" onClick={() => setSidebarOpen(true)} className={`${styles.mobileOnly} p-2`}><Menu size={21} /></button><Link href="/" className={styles.brand}><span className={styles.brandMark}>ب</span><span>Be Fluent</span></Link></div>
      <nav className={styles.desktopNav}><Link href="/dashboard/student/lessons">الدروس</Link><Link href="/dashboard/student/vocabulary">المفردات</Link><Link href="/dashboard/student/conversation-practice">الممارسة</Link></nav>
      <div className={styles.headerTools}><span className={styles.status}>{user.isActive ? 'حساب نشط' : 'قيد التفعيل'}</span><Link href="/dashboard/student/cart" aria-label="السلة" className="relative p-2"><ShoppingCart size={19}/>{cartItemsCount > 0 && <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 bg-[#0e4c3a] text-[#fffdf7] text-[9px] grid place-items-center rounded-full">{cartItemsCount}</span>}</Link><Button variant="outline" size="sm" onClick={handleSignOut} className="!border-[#d7ddd3] !rounded-none !text-[#20332c]"><LogOut size={15} className="ml-1" />خروج</Button></div>
    </div></header>
    {sidebarOpen && <button aria-label="إغلاق القائمة" className={styles.mobileOverlay} onClick={() => setSidebarOpen(false)} />}
    <div className={styles.page}><div className={styles.shell}>
      <aside className={`${styles.side} ${sidebarOpen ? styles.sideOpen : ''}`}>
        <button aria-label="إغلاق القائمة" onClick={() => setSidebarOpen(false)} className={`${styles.mobileOnly} absolute top-4 left-4 p-1`}><ChevronLeft size={20}/></button>
        <div className={styles.profile}><div className="flex items-center gap-3"><div className={styles.avatar}>{user.name?.charAt(0)}</div><div className="min-w-0"><p className="font-bold truncate">{user.name}</p><p className="text-xs text-[#6e776f] truncate">{user.email}</p></div></div><div className="mt-4 flex items-center justify-between text-[11px]"><span className="text-[#6e776f]">التقدم في المستوى</span><span className="font-bold text-[#0e4c3a]">450 / 1000 XP</span></div><div className="h-1 bg-[#dfe9df] mt-2"><div className="h-full w-[45%] bg-[#0e4c3a]" /></div></div>
        <p className={styles.sectionLabel}>مساحتك التعليمية</p>{renderMenu(primary)}<p className={styles.sectionLabel}>استكشف</p>{renderMenu(explore)}
      </aside>
      <main className={styles.surface}>
        {!user.isActive && <div className={styles.notice}><strong>{subscription?.status === 'PENDING' ? 'طلبك قيد المراجعة' : 'حسابك غير مفعّل'}</strong><span className="mr-2">اختر باقة وأكمل خطوات الاشتراك للوصول إلى جميع أدوات التعلم.</span></div>}
        {activeTab === 'home' && <HomeTab isActive={user.isActive} />}
        {activeTab === 'sessions' && <SessionsTab isActive={user.isActive} />}
        {activeTab === 'certificates' && <CertificatesTab />}
        {activeTab === 'homework' && <HomeworkTab isActive={user.isActive} />}
        {activeTab === 'packages' && <PackagesTab isActive={user.isActive} onCartUpdate={fetchCartCount} />}
      </main>
    </div></div>
  </div>
}