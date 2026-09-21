import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'

export const dynamic = 'force-dynamic'

export default function TeacherClassesPage() {
  return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Teacher workspace</div><h1 className={styles.title}>My classes</h1><p className={styles.muted}>A reliable read on what is taught next and what happened last.</p></div><Phase4Nav area="teacher" /></header><ClassesClient role="teacher" /></div></main>
}