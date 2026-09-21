import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
export const dynamic = 'force-dynamic'
export default function StudentHomeworkPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Student workspace · phase 7</div><h1 className={styles.title}>My homework</h1><p className={styles.muted}>Assigned work, submission state, and teacher reviews.</p></div><Phase4Nav area="student" /></header><LearningClient role="student" kind="homework" /></div></main> }