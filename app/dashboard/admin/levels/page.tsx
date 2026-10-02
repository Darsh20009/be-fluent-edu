import { redirect } from 'next/navigation'
import { requirePermission, isNextResponse } from '@/lib/auth-helpers'
import LevelsClient from './LevelsClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function LevelsPage() {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) redirect(access.status === 401 ? '/auth/login' : '/dashboard')
  const language = await getServerLanguage()
  return <section className="space-y-4">
    <p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'هيكل التعلم الرسمي المتاح في النظام.', 'Official learning structure available in the system.')}</p>
    <LevelsClient />
  </section>
}