import { AdminIntelligence } from '@/app/dashboard/phase9/IntelligenceClient'
import { requireAdminPageAccess } from '../page-access'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export default async function Page() {
  await requireAdminPageAccess()
  const language = await getServerLanguage()
  return <section className="space-y-4"><p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'تحليلات الأداء ومؤشرات التعلم للطلاب.', 'Student learning analytics and performance insights.')}</p><AdminIntelligence /></section>
}