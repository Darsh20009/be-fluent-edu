import { AdminSpeaking } from '@/app/dashboard/SpeakingClient'
import { requireAdminPageAccess } from '../page-access'

export default async function Page() {
  await requireAdminPageAccess()
  return <AdminSpeaking />
}