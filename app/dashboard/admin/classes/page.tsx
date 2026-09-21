import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'

export const dynamic = 'force-dynamic'

export default function AdminClassesPage() {
  return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Admin · learning operations</div><h1 className={styles.title}>Classes</h1><p className={styles.muted}>Sessions, schedules, attendance, and QMeet readiness.</p></div><Phase4Nav area="admin" /></header><ClassesClient role="admin" /></div></main>
}