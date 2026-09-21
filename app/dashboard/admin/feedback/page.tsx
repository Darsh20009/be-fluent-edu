import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
export const dynamic = 'force-dynamic'
export default function AdminFeedbackPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Admin · phase 7</div><h1 className={styles.title}>Feedback</h1><p className={styles.muted}>Session feedback and the shared language library.</p></div><Phase4Nav area="admin" /></header><LearningClient role="admin" kind="feedback" /></div></main> }