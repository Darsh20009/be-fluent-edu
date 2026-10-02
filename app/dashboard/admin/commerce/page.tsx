import { requireAdminPageAccess } from '../page-access'
import CommerceClient from './CommerceClient'

export const dynamic = 'force-dynamic'

export default async function CommercePage() {
  await requireAdminPageAccess()
  return <section className="space-y-4">
    <p className="text-sm leading-6 text-[#68756e]">Manage packages, enrollment, group capacity, teachers, and schedules.</p>
    <CommerceClient />
  </section>
}