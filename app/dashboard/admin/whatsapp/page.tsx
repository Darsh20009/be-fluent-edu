import { requireAdminPageAccess } from '../page-access'
import { WhatsAppCRMWorkspace } from './WhatsAppCRMWorkspace'

export default async function Page() {
  await requireAdminPageAccess()
  return (
    <section className="space-y-4">
      <p className="text-sm leading-6 text-[#68756e]">إدارة الأرقام والربط والمحادثات من مساحة واحدة.</p>
      <WhatsAppCRMWorkspace />
    </section>
  )
}