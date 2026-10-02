import { requireAdminPageAccess } from '../page-access'
import { WhatsAppCRMWorkspace } from './WhatsAppCRMWorkspace'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export default async function Page() {
  await requireAdminPageAccess()
  const language = await getServerLanguage()
  return (
    <section className="space-y-4">
      <p className="text-sm leading-6 text-[#68756e]">{localeText(language, 'إدارة الأرقام والربط والمحادثات من مساحة واحدة.', 'Manage numbers, connections, and conversations in one workspace.')}</p>
      <WhatsAppCRMWorkspace />
    </section>
  )
}