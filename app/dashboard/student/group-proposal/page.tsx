import { redirect } from 'next/navigation'
import { isNextResponse, requireStudent } from '@/lib/auth-helpers'
import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import StudentGroupProposalClient from './StudentGroupProposalClient'

export const dynamic = 'force-dynamic'

export default async function StudentGroupProposalPage() {
  const access = await requireStudent()
  if (isNextResponse(access)) redirect('/auth/login')
  return <main className={styles.shell}><div className={styles.container}>
    <header className={styles.header}>
      <div>
        <div className={styles.eyebrow}>Student services</div>
        <h1 className={styles.title}>Group suggestion</h1>
        <p className={styles.muted}>Review a suggested class before the administrator confirms your assignment.</p>
      </div>
      <Phase4Nav area="student" />
    </header>
    <StudentGroupProposalClient />
  </div></main>
}