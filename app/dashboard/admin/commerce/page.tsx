import { requireAdminPageAccess } from '../page-access'
import CommerceClient from './CommerceClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function CommercePage() {
  await requireAdminPageAccess()
  const language = await getServerLanguage()
  return <section className="space-y-4">
    <p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'إدارة الباقات والتسجيل وسعة المجموعات والمعلمين والجداول.', 'Manage packages, enrollment, group capacity, teachers, and schedules.')}</p>
    <CommerceClient />
  </section>
}