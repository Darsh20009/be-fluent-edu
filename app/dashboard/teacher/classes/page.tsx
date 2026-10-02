import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function TeacherClassesPage() {
  const language = await getServerLanguage()
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة المعلم', 'Teacher workspace')}</div><h1 className={styles.title}>{localeText(language, 'حصصي', 'My classes')}</h1><p className={styles.muted}>{localeText(language, 'نظرة واضحة على ما سيتم تدريسه وما تم إنجازه.', 'A reliable read on what is taught next and what happened last.')}</p></div><Phase4Nav area="teacher" /></header><ClassesClient role="teacher" /></div></main>
}