import { redirect } from 'next/navigation'
import { requireAdminPageAccess } from '../page-access'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'
import FinanceClient from './FinanceClient'

export const dynamic = 'force-dynamic'

export default async function FinancePage() {
  const session = await requireAdminPageAccess()
  if (session.user.role !== 'ADMIN') redirect('/dashboard/admin')
  const language = await getServerLanguage()
  return (
    <section className="space-y-4">
      <p className="text-sm leading-6 text-[#68756e]">
        {localeText(language, 'الإيرادات المحصلة والتكاليف الشهرية وأجور الحصص المكتملة.', 'Cash received, monthly costs, and compensation for completed lessons.')}
      </p>
      <FinanceClient />
    </section>
  )
}