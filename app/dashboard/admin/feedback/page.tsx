import { requireAdminPageAccess } from '../page-access'
import LearningClient from '@/app/dashboard/learning/LearningClient'

export const dynamic = 'force-dynamic'

export default async function AdminFeedbackPage() {
  await requireAdminPageAccess()
  return <section className="space-y-4"><p className="text-sm leading-6 text-[#68756e]">Session feedback and the shared language library.</p><LearningClient role="admin" kind="feedback" /></section>
}