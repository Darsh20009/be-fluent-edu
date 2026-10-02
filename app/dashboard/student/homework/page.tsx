import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import LearningClient from '@/app/dashboard/learning/LearningClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'
export const dynamic = 'force-dynamic'
export default async function StudentHomeworkPage() {
  const language = await getServerLanguage()
  return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة الطالب · المرحلة 7', 'Student workspace · phase 7')}</div><h1 className={styles.title}>{localeText(language, 'واجباتي', 'My homework')}</h1><p className={styles.muted}>{localeText(language, 'الواجبات المخصصة، وحالة التسليم، ومراجعات المعلم.', 'Assigned work, submission state, and teacher reviews.')}</p></div><Phase4Nav area="student" /></header><LearningClient role="student" kind="homework" /></div></main>
}