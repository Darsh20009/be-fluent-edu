import { redirect } from 'next/navigation'
import { requirePermission, isNextResponse } from '@/lib/auth-helpers'
import { Phase4Nav } from '@/app/phase4/nav'
import TeacherStudentsClient from './TeacherStudentsClient'
import styles from '@/app/phase4/phase4.module.css'

export const dynamic = 'force-dynamic'

export default async function TeacherStudentsPage() {
  const access = await requirePermission('teacher.viewStudents')
  if (isNextResponse(access)) redirect('/auth/login')
  return <main className={styles.shell}><div className={styles.container}>
    <header className={styles.header}><div><div className={styles.eyebrow}>Teacher foundation</div><h1 className={styles.title}>My students</h1><p className={styles.muted}>Student records and level recommendations foundation.</p></div><Phase4Nav area="teacher" /></header>
    <TeacherStudentsClient />
  </div></main>
}