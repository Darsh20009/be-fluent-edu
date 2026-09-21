import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'

export const dynamic = 'force-dynamic'

export default function StudentClassesPage() {
  return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Student workspace</div><h1 className={styles.title}>My classes</h1><p className={styles.muted}>Your class schedule and joining access, without the noise.</p></div><Phase4Nav area="student" /></header><ClassesClient role="student" /></div></main>
}