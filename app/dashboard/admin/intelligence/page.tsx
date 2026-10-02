import { AdminIntelligence } from '@/app/dashboard/phase9/IntelligenceClient'
import { requireAdminPageAccess } from '../page-access'

export default async function Page() {
  await requireAdminPageAccess()
  return <AdminIntelligence />
}