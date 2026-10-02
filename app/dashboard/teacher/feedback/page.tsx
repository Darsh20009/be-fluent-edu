import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import TeacherFeedbackWorkspace from './TeacherFeedbackWorkspace'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'
export const dynamic = 'force-dynamic'
export default async function TeacherFeedbackPage() { const language = await getServerLanguage(); return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة المعلم · المرحلة 7', 'Teacher workspace · phase 7')}</div><h1 className={styles.title}>{localeText(language, 'ملاحظات الحصص', 'Class feedback')}</h1><p className={styles.muted}>{localeText(language, 'اكتب ملاحظات الحصة، راجعها، ثم انشرها للطالب.', 'Write session feedback, review it, then publish it for the student.')}</p></div><Phase4Nav area="teacher" /></header><TeacherFeedbackWorkspace /></div></main> }