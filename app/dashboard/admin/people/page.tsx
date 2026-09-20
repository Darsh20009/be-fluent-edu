import { redirect } from 'next/navigation'
import { requirePermission, isNextResponse } from '@/lib/auth-helpers'
import { Phase4Nav } from '@/app/phase4/nav'
import PeopleClient from './PeopleClient'
import styles from '@/app/phase4/phase4.module.css'

export const dynamic = 'force-dynamic'

export default async function PeoplePage() {
  const access = await requirePermission('admin.viewPeople')
  if (isNextResponse(access)) redirect('/auth/login')
  return <main className={styles.shell}><div className={styles.container}>
    <header className={styles.header}>
      <div><div className={styles.eyebrow}>B Fluent Control Center</div><h1 className={styles.title}>People</h1><p className={styles.muted}>Students, teachers, and staff from the live system.</p></div>
      <Phase4Nav area="admin" />
    </header>
    <PeopleClient />
  </div></main>
}