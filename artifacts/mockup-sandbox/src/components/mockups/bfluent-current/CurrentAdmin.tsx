import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  PhoneCall,
  Server,
  Shield,
  Tag,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import './_group.css'

type MenuItem = { id: string; label: string; icon: LucideIcon }
type MenuGroup = { label: string; items: MenuItem[] }

const menuGroups: MenuGroup[] = [
  { label: 'الرئيسية', items: [{ id: 'home', label: 'لوحة التحكم', icon: Home }] },
  { label: 'العملاء المحتملون', items: [{ id: 'leads', label: 'طلبات الحجز', icon: PhoneCall }] },
  {
    label: 'إدارة المستخدمين',
    items: [
      { id: 'users', label: 'المستخدمين', icon: Users },
      { id: 'students', label: 'الطلاب', icon: BookOpen },
      { id: 'subscriptions', label: 'الاشتراكات', icon: CreditCard },
      { id: 'coupons', label: 'الكوبونات', icon: Tag },
    ],
  },
  {
    label: 'المحتوى التعليمي',
    items: [
      { id: 'lessons', label: 'الدروس', icon: Layers },
      { id: 'placement-test', label: 'اختبار تحديد المستوى', icon: ClipboardList },
      { id: 'page-editor', label: 'محرر الصفحات (CMS)', icon: Globe },
    ],
  },
  {
    label: 'النظام',
    items: [
      { id: 'email', label: 'البريد المباشر', icon: Mail },
      { id: 'system', label: 'النظام والسجلات', icon: Activity },
    ],
  },
]

const adminUser = { name: 'مريم أحمد', role: 'ADMIN' }

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

const adminStats = {
  totalStudents: 328,
  activeStudents: 286,
  totalRevenue: 184750,
  sessionsThisWeek: 46,
  pendingSubscriptions: 5,
  totalTeachers: 24,
  health: { database: 'CONNECTED', email: 'ACTIVE' },
  monthlyRevenue: [
    { month: 'أبريل', revenue: 12800 },
    { month: 'مايو', revenue: 16400 },
    { month: 'يونيو', revenue: 14200 },
    { month: 'يوليو', revenue: 21300 },
    { month: 'أغسطس', revenue: 19700 },
    { month: 'سبتمبر', revenue: 25400 },
  ],
  recentSubscriptions: [
    { id: 'sub-1', status: 'PENDING', createdAt: daysAgo(0), User: { name: 'Omar Khaled' }, Package: { title: '12-session package' } },
    { id: 'sub-2', status: 'APPROVED', createdAt: daysAgo(1), User: { name: 'Lina Samir' }, Package: { title: 'Monthly conversation plan' } },
    { id: 'sub-3', status: 'PENDING', createdAt: daysAgo(2), User: { name: 'Youssef Adel' }, Package: { title: '8-session package' } },
    { id: 'sub-4', status: 'APPROVED', createdAt: daysAgo(3), User: { name: 'Hana Ibrahim' }, Package: { title: 'Private lessons' } },
  ],
  recentUsers: [
    { id: 'user-1', name: 'Omar Khaled', role: 'STUDENT', createdAt: daysAgo(0) },
    { id: 'user-2', name: 'Mona Fathy', role: 'TEACHER', createdAt: daysAgo(1) },
    { id: 'user-3', name: 'Lina Samir', role: 'STUDENT', createdAt: daysAgo(2) },
    { id: 'user-4', name: 'Hana Ibrahim', role: 'STUDENT', createdAt: daysAgo(3) },
  ],
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? '—' : date.toLocaleDateString('ar')
}

function getServiceState(value: string | undefined, activeValue: string) {
  if (!value) return 'غير متاح'
  return value.toLowerCase() === activeValue ? (activeValue === 'connected' ? 'متصل' : 'نشط') : 'غير متاح'
}

function AdminHome({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const pendingSubscriptions = adminStats.pendingSubscriptions
  const tiles = [
    { label: 'إجمالي الطلاب', value: String(adminStats.totalStudents), icon: Users },
    { label: 'الطلاب النشطون', value: String(adminStats.activeStudents), icon: UserCheck },
    { label: 'إجمالي الإيرادات', value: `${adminStats.totalRevenue.toLocaleString('ar')} ج.م`, icon: CreditCard },
    { label: 'حصص هذا الأسبوع', value: String(adminStats.sessionsThisWeek), icon: Calendar },
    { label: 'اشتراكات بانتظار المراجعة', value: String(pendingSubscriptions), icon: Clock },
    { label: 'المعلمون', value: String(adminStats.totalTeachers), icon: Users },
  ]
  const maxRevenue = Math.max(...adminStats.monthlyRevenue.map((item) => item.revenue))

  return (
    <div className="space-y-6 sm:space-y-7">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold text-[#66806e]">Be Fluent · الإدارة</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#26332e] sm:text-[28px]">نظرة عامة</h1>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg border border-[#dfe6df] px-4 text-sm font-semibold text-[#3d614b] hover:bg-[#f3f7f3] sm:self-auto"
        >
          الاشتراكات
          {pendingSubscriptions > 0 && (
            <span className="min-w-6 rounded-full bg-[#edf4ef] px-2 py-1 text-center text-xs font-bold tabular-nums text-[#286547]">{pendingSubscriptions}</span>
          )}
        </button>
      </header>

      {tiles.length > 0 && (
        <section aria-label="إحصاءات فعلية" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <article key={tile.label} className="flex min-h-[112px] items-center gap-4 rounded-xl border border-[#e0e6e1] bg-white p-4 sm:p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#edf4ef] text-[#327453]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#68756e]">{tile.label}</p>
                  <p className="mt-1.5 text-2xl font-bold leading-none tabular-nums text-[#26332e]">{tile.value}</p>
                </div>
              </article>
            )
          })}
        </section>
      )}

      <section aria-label="مهام الإدارة" className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
        <div className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-[#26332e]">ما يحتاج متابعة</h2>
              <p className="mt-1 text-sm text-[#718078]">انتقل مباشرة إلى قائمة العمل المرتبطة.</p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f5f1e8] text-[#866b35]">
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('subscriptions')}
            className="mt-5 flex min-h-[68px] w-full items-center justify-between gap-4 rounded-lg border border-[#e7ebe7] px-4 text-right hover:bg-[#f7f9f7]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CreditCard size={18} className="shrink-0 text-[#557360]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#334239]">طلبات الاشتراك</span>
                <span className="mt-1 block text-xs text-[#718078]">مراجعة الطلبات المسجلة</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-[#315f49]">
              {pendingSubscriptions} بانتظار المراجعة
              <ArrowLeft size={16} aria-hidden="true" />
            </span>
          </button>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setActiveTab('leads')}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-4 text-sm font-semibold text-[#465a4e] hover:bg-[#edf3ee]"
            >
              طلبات الحجز <PhoneCall size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-4 text-sm font-semibold text-[#465a4e] hover:bg-[#edf3ee]"
            >
              النظام والسجلات <FileText size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <section className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-bold text-[#26332e]">
            <Server size={18} className="text-[#527360]" aria-hidden="true" />
            حالة الخدمات المسجلة
          </h2>
          <p className="mt-1 text-xs text-[#7a867f]">الحالة الواردة من بيانات النظام</p>
          <div className="mt-4 space-y-2">
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-3">
              <span className="flex items-center gap-2 text-sm text-[#536258]"><Activity size={16} aria-hidden="true" />قاعدة البيانات</span>
              <span className="text-sm font-semibold text-[#3d614b]">{getServiceState(adminStats.health.database, 'connected')}</span>
            </div>
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg bg-[#f6f8f6] px-3">
              <span className="flex items-center gap-2 text-sm text-[#536258]"><Mail size={16} aria-hidden="true" />خدمة البريد</span>
              <span className="text-sm font-semibold text-[#3d614b]">{getServiceState(adminStats.health.email, 'active')}</span>
            </div>
          </div>
        </section>
      </section>

      <section aria-label="بيانات النشاط" className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-[#e0e6e1] bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-[#26332e]">
                <BarChart3 size={18} className="text-[#527360]" aria-hidden="true" />
                الإيرادات الشهرية
              </h2>
              <p className="mt-1 text-xs text-[#718078]">القيم كما وردت في تقرير النظام</p>
            </div>
            <span className="text-xs text-[#718078]">ج.م</span>
          </div>
          <div className="mt-6 flex min-h-40 items-end gap-3 overflow-x-auto border-b border-[#e8ece8] pb-3">
            {adminStats.monthlyRevenue.map((item, index) => (
              <div key={`${item.month}-${index}`} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-semibold tabular-nums text-[#6d7a71]">{item.revenue.toLocaleString('ar')}</span>
                <div
                  aria-label={`${item.month}: ${item.revenue.toLocaleString('ar')} جنيه`}
                  className="w-full max-w-10 rounded-t bg-[#6a9b7d]"
                  role="img"
                  style={{ height: `${Math.max(6, (item.revenue / maxRevenue) * 108)}px` }}
                />
                <span className="max-w-full truncate text-[11px] text-[#6d7a71]">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#e0e6e1] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8ece8] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-[#26332e]">أحدث الاشتراكات</h2>
              <p className="mt-1 text-xs text-[#718078]">الطلبات المسجلة مؤخراً</p>
            </div>
            <button type="button" onClick={() => setActiveTab('subscriptions')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#315f49]">
              عرض الكل <ArrowLeft size={15} aria-hidden="true" />
            </button>
          </div>
          <ul className="divide-y divide-[#edf0ed]">
            {adminStats.recentSubscriptions.slice(0, 4).map((sub) => {
              const statusLabel = sub.status === 'APPROVED' ? 'مقبول' : sub.status === 'PENDING' ? 'معلّق' : 'مرفوض'
              return (
                <li key={sub.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#334239]">{sub.User.name}</p>
                    <p className="mt-1 truncate text-xs text-[#718078]">{sub.Package.title} · {formatDate(sub.createdAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${sub.status === 'APPROVED' ? 'bg-[#edf4ef] text-[#286547]' : 'bg-[#f8f2e3] text-[#80662d]'}`}>
                    {statusLabel}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e0e6e1] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-[#e8ece8] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-bold text-[#26332e]">مستخدمون أُضيفوا مؤخراً</h2>
            <p className="mt-1 text-xs text-[#718078]">بحسب أحدث البيانات المتاحة</p>
          </div>
          <button type="button" onClick={() => setActiveTab('users')} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#315f49]">
            المستخدمون <ArrowLeft size={15} aria-hidden="true" />
          </button>
        </div>
        <ul className="grid divide-y divide-[#edf0ed] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {adminStats.recentUsers.slice(0, 4).map((user) => (
            <li key={user.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf4ef] text-xs font-bold text-[#286547]">
                {user.name.trim().charAt(0).toUpperCase() || '؟'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#334239]">{user.name}</span>
                <span className="mt-1 block truncate text-xs text-[#718078]">{user.role} · {formatDate(user.createdAt)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function FloatingContact() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 2000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 transition-all duration-1000 sm:bottom-10 sm:right-10 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-10 opacity-0'}`}>
      <span className="rounded-2xl border border-emerald-100/50 bg-white/90 px-5 py-2.5 text-sm font-bold text-[#1f2937] shadow-xl">
        تواصل معنا الآن
      </span>
      <button
        type="button"
        aria-label="تواصل معنا الآن"
        className="grid h-16 w-16 place-items-center rounded-[24px] bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-xl"
      >
        <MessageCircle size={29} aria-hidden="true" />
      </button>
    </div>
  )
}

export default function CurrentAdmin() {
  const [activeTab, setActiveTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activeLabel = menuGroups.flatMap((group) => group.items).find((item) => item.id === activeTab)?.label || 'لوحة التحكم'

  return (
    <div className="bfluent-current-admin min-h-[100dvh] bg-[#f5f7f4] text-[#26332e]" dir="rtl">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-40 bg-[#172b21]/35 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[min(320px,88vw)] flex-col border-l border-[#e0e6e1] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-[100dvh] lg:w-[270px] lg:shrink-0 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="flex min-h-[76px] items-center justify-between border-b border-[#e8ece8] px-5">
          <a href="#admin-home" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#247456] text-white">
              <Shield size={19} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#26332e]">Be Fluent</span>
              <span className="mt-1 block text-[11px] font-medium text-[#76827a]">مساحة الإدارة</span>
            </span>
          </a>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#68756e] hover:bg-[#f3f6f3] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <div className="mx-4 my-4 flex items-center gap-3 rounded-lg bg-[#f5f7f4] p-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e6f0e8] text-sm font-extrabold text-[#286547]">
            {adminUser.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-[#2d3a32]">{adminUser.name}</span>
            <span className="mt-1 block truncate text-xs text-[#718078]">مدير النظام</span>
          </span>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="التنقل الرئيسي للإدارة">
          {menuGroups.map((group) => (
            <section key={group.label}>
              <h2 className="px-3 pb-2 text-[11px] font-semibold text-[#839087]">{group.label}</h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const selected = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={selected ? 'page' : undefined}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-right text-sm transition-colors ${selected ? 'bg-[#edf5ef] font-bold text-[#225d41]' : 'text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]'}`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.id === 'subscriptions' && adminStats.pendingSubscriptions > 0 && (
                        <span className="min-w-6 rounded-full bg-[#f5f1e7] px-2 py-1 text-center text-[11px] font-bold tabular-nums text-[#80662d]">
                          {adminStats.pendingSubscriptions}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="space-y-1 border-t border-[#e8ece8] p-3">
          <a href="#teacher-dashboard" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#5c6961] hover:bg-[#f5f7f5] hover:text-[#225d41]">
            <GraduationCap size={18} aria-hidden="true" />
            لوحة المعلم
          </a>
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#80534b] hover:bg-[#faf3f1]"
          >
            <LogOut size={18} aria-hidden="true" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="min-h-[100dvh] lg:-mt-[100dvh] lg:mr-[270px]">
        <header className="sticky top-0 z-30 border-b border-[#e0e6e1] bg-white/95">
          <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="فتح القائمة"
                aria-expanded={sidebarOpen}
                className="grid min-h-11 min-w-11 place-items-center rounded-lg border border-[#e0e6e1] text-[#315f49] hover:bg-[#f2f7f2] lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={19} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <div className="mb-1 hidden items-center gap-1.5 text-[11px] font-medium text-[#89938d] sm:flex">
                  <span>الإدارة</span>
                  <ChevronRight size={13} aria-hidden="true" />
                  <span className="truncate text-[#477557]">{activeLabel}</span>
                </div>
                <h1 className="truncate text-lg font-bold text-[#26332e] sm:text-xl">{activeLabel}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-[#344239]">{adminUser.name}</span>
                <span className="mt-1 block text-[11px] text-[#718078]">مدير النظام</span>
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6f0e8] text-sm font-extrabold text-[#286547]">
                {adminUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6" id="admin-home">
          <AdminHome setActiveTab={setActiveTab} />
        </main>
      </div>
      <FloatingContact />
    </div>
  )
}