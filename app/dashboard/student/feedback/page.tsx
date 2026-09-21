import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
export const dynamic = 'force-dynamic'
export default function StudentFeedbackPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Student workspace · phase 7</div><h1 className={styles.title}>My feedback</h1><p className={styles.muted}>Published feedback for your completed classes.</p></div><Phase4Nav area="student" /></header><LearningClient role="student" kind="feedback" /></div></main> }