import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
export const dynamic = 'force-dynamic'
export default function TeacherHomeworkPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Teacher workspace · phase 7</div><h1 className={styles.title}>Homework</h1><p className={styles.muted}>Assignments and review workflow.</p></div><Phase4Nav area="teacher" /></header><LearningClient role="teacher" kind="homework" /></div></main> }