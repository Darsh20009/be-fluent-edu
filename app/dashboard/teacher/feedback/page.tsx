import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import TeacherFeedbackWorkspace from './TeacherFeedbackWorkspace'
export const dynamic = 'force-dynamic'
export default function TeacherFeedbackPage() { return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>Teacher workspace · phase 7</div><h1 className={styles.title}>ملاحظات الحصص</h1><p className={styles.muted}>اكتب ملاحظات الحصة، راجعها، ثم انشرها للطالب.</p></div><Phase4Nav area="teacher" /></header><TeacherFeedbackWorkspace /></div></main> }