import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
export const dynamic = 'force-dynamic'
export default function TeacherFeedbackPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Teacher workspace · phase 7</div><h1 className={styles.title}>Feedback</h1><p className={styles.muted}>Draft feedback from completed sessions and approved libraries.</p></div><Phase4Nav area="teacher" /></header><LearningClient role="teacher" kind="feedback" /></div></main> }