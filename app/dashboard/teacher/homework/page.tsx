import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'
export const dynamic = 'force-dynamic'
export default async function TeacherHomeworkPage() { const language = await getServerLanguage(); return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة المعلم · المرحلة 7', 'Teacher workspace · phase 7')}</div><h1 className={styles.title}>{localeText(language, 'الواجبات', 'Homework')}</h1><p className={styles.muted}>{localeText(language, 'إدارة الواجبات ومراجعة التسليمات.', 'Assignments and review workflow.')}</p></div><Phase4Nav area="teacher" /></header><LearningClient role="teacher" kind="homework" /></div></main> }