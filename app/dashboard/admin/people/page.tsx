import { redirect } from 'next/navigation'
import { requirePermission, isNextResponse } from '@/lib/auth-helpers'
import PeopleClient from './PeopleClient'

export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) redirect(access.status === 401 ? '/auth/login' : '/dashboard')
  return <section className="space-y-4">
    <p className="text-sm leading-6 text-[#68756e]">Students, teachers, and staff from the live system.</p>
    <PeopleClient />
  </section>
}