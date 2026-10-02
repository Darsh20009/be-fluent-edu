import { requireAdminPageAccess } from '../page-access'
import LearningClient from '@/app/dashboard/learning/LearningClient'

export const dynamic = 'force-dynamic'

export default async function AdminHomeworkPage() {
  await requireAdminPageAccess()
  return <section className="space-y-4"><p className="text-sm leading-6 text-[#68756e]">Assignments, submissions, and reviews.</p><LearningClient role="admin" kind="homework" /></section>
}