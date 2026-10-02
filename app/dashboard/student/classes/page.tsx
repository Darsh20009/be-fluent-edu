import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import ClassesClient from '@/app/dashboard/classes/ClassesClient'
import { getServerLanguage } from '@/lib/server-locale'
import { localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function StudentClassesPage() {
  const language = await getServerLanguage()
  return <main className={styles.shell}><div className={styles.container}><header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة الطالب', 'Student workspace')}</div><h1 className={styles.title}>{localeText(language, 'حصصي', 'My classes')}</h1><p className={styles.muted}>{localeText(language, 'جدول حصصك وروابط الانضمام إليها.', 'Your class schedule and joining access.')}</p></div><Phase4Nav area="student" /></header><ClassesClient role="student" /></div></main>
}