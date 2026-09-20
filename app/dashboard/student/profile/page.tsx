import { redirect } from 'next/navigation'
import { requireStudent, isNextResponse } from '@/lib/auth-helpers'
import { Phase4Nav } from '@/app/phase4/nav'
import StudentProfileClient from './StudentProfileClient'
import styles from '@/app/phase4/phase4.module.css'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const access = await requireStudent()
  if (isNextResponse(access)) redirect('/auth/login')
  return <main className={styles.shell}><div className={styles.container}>
    <header className={styles.header}><div><div className={styles.eyebrow}>Student foundation</div><h1 className={styles.title}>My profile</h1><p className={styles.muted}>Your current level, focus, and learning profile.</p></div><Phase4Nav area="student" /></header>
    <StudentProfileClient />
  </div></main>
}