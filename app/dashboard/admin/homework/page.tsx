import { requireAdminPageAccess } from '../page-access'
import LearningClient from '@/app/dashboard/learning/LearningClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function AdminHomeworkPage() {
  await requireAdminPageAccess()
  const language = await getServerLanguage()
  return <section className="space-y-4"><p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'الواجبات والتسليمات والمراجعات.', 'Assignments, submissions, and reviews.')}</p><LearningClient role="admin" kind="homework" /></section>
}