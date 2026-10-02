import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { BookOpen, Calendar, Layers, MessageCircle, PhoneCall, Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { Phase4Nav } from '@/app/phase4/nav'
import LanguageToggle from '@/components/LanguageToggle'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'

const managerLinks = [
  {
    href: '/dashboard/admin/people',
    label: ['الأشخاص', 'People'],
    description: ['ابحث عن الطلاب والمدرسين وأدر ملفاتهم.', 'Find students and teachers, and manage their profiles.'],
    icon: Users,
  },
  {
    href: '/dashboard/admin/classes',
    label: ['الحصص', 'Classes'],
    description: ['تابع الحصص ومواعيدها وحالاتها.', 'Track classes, schedules, and their status.'],
    icon: Calendar,
  },
  {
    href: '/dashboard/admin/feedback',
    label: ['ملاحظات الحصص', 'Class feedback'],
    description: ['راجع Feedback المرتبط بالحصص والطلاب.', 'Review feedback associated with classes and students.'],
    icon: MessageCircle,
  },
  {
    href: '/dashboard/admin/homework',
    label: ['الواجبات', 'Homework'],
    description: ['تابع الواجبات وحالات التسليم.', 'Track homework and submission status.'],
    icon: BookOpen,
  },
  {
    href: '/dashboard/admin/levels',
    label: ['المستويات', 'Levels'],
    description: ['أدر مستويات الطلاب ومحتواها.', 'Manage student levels and their content.'],
    icon: Layers,
  },
  {
    href: '/dashboard/admin/whatsapp',
    label: ['WhatsApp CRM', 'WhatsApp CRM'],
    description: ['أدر المحادثات والحسابات وقائمة الإرسال.', 'Manage conversations, accounts, and the messaging list.'],
    icon: PhoneCall,
  },
]

export const dynamic = 'force-dynamic'

export default async function ManagerDashboardPage() {
  const session = await getServerSession(authOptions)
  const language = await getServerLanguage()

  if (!session) {
    redirect('/auth/login')
  }

  if (session.user.role !== 'MANAGER') {
    redirect('/dashboard')
  }

  return (
    <main
      className="min-h-[100dvh] px-4 py-5 sm:px-6 sm:py-8"
      dir={localeDirection(language)}
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{localeText(language, 'مساحة المدير', 'Manager workspace')}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{localeText(language, 'إدارة B Fluent', 'B Fluent management')}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--muted)' }}>
                {localeText(language, 'الوصول إلى مهام الإدارة الممنوحة لدورك، دون صلاحيات إدارة النظام الكاملة.', 'Access the management tasks granted to your role, without full system administration permissions.')}
              </p>
            </div>
            <LanguageToggle />
          </div>
          <Phase4Nav area="manager" />
        </header>

        <section aria-labelledby="manager-shortcuts-title">
          <h2 id="manager-shortcuts-title" className="mb-4 text-lg font-bold">{localeText(language, 'اختصارات الإدارة', 'Management shortcuts')}</h2>
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
                  <span className="block font-semibold">{localeText(language, label[0], label[1])}</span>
                  <span className="mt-1 block text-sm leading-6" style={{ color: 'var(--muted)' }}>
                    {localeText(language, description[0], description[1])}
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