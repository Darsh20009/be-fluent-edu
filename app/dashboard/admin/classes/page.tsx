import { redirect } from 'next/navigation'
import { isNextResponse, requirePermission } from '@/lib/auth-helpers'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function AdminClassesPage() {
  const access = await requirePermission('admin.manageSessions')
  if (isNextResponse(access)) {
    if (access.status === 401) redirect('/auth/login')
    redirect('/dashboard')
  }
  const language = await getServerLanguage()

  return (
    <section className="space-y-4">
      <p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'الجلسات والجداول والحضور وجاهزية QMeet.', 'Sessions, schedules, attendance, and QMeet readiness.')}</p>
      <ClassesClient role="admin" />
    </section>
  )
}