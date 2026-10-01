import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { BookOpen, Calendar, Layers, MessageCircle, PhoneCall, Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { Phase4Nav } from '@/app/phase4/nav'

const managerLinks = [
  {
    href: '/dashboard/admin/people',
    label: 'الأشخاص',
    description: 'ابحث عن الطلاب والمدرسين وأدر ملفاتهم.',
    icon: Users,
  },
  {
    href: '/dashboard/admin/classes',
    label: 'الحصص',
    description: 'تابع الحصص ومواعيدها وحالاتها.',
    icon: Calendar,
  },
  {
    href: '/dashboard/admin/feedback',
    label: 'ملاحظات الحصص',
    description: 'راجع Feedback المرتبط بالحصص والطلاب.',
    icon: MessageCircle,
  },
  {
    href: '/dashboard/admin/homework',
    label: 'الواجبات',
    description: 'تابع الواجبات وحالات التسليم.',
    icon: BookOpen,
  },
  {
    href: '/dashboard/admin/levels',
    label: 'المستويات',
    description: 'أدر مستويات الطلاب ومحتواها.',
    icon: Layers,
  },
  {
    href: '/dashboard/admin/whatsapp',
    label: 'WhatsApp CRM',
    description: 'أدر المحادثات والحسابات وقائمة الإرسال.',
    icon: PhoneCall,
  },
]

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'MANAGER') {
    redirect('/dashboard')
  }

  return (
    <main
      className="min-h-[100dvh] px-4 py-5 sm:px-6 sm:py-8"
      dir="rtl"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 space-y-5">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>مساحة المدير</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">إدارة B Fluent</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--muted)' }}>
              الوصول إلى مهام الإدارة الممنوحة لدورك، دون صلاحيات إدارة النظام الكاملة.
            </p>
          </div>
          <Phase4Nav area="manager" />
        </header>

        <section aria-labelledby="manager-shortcuts-title">
          <h2 id="manager-shortcuts-title" className="mb-4 text-lg font-bold">اختصارات الإدارة</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {managerLinks.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex min-h-28 items-start gap-4 rounded-2xl border p-5 transition-colors hover:border-[var(--primary)]"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: 'var(--bf-green-soft)', color: 'var(--primary)' }}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{label}</span>
                  <span className="mt-1 block text-sm leading-6" style={{ color: 'var(--muted)' }}>
                    {description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}