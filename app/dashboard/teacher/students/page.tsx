import { redirect } from 'next/navigation'
import { requirePermission, isNextResponse } from '@/lib/auth-helpers'
import { Phase4Nav } from '@/app/phase4/nav'
import TeacherStudentsClient from './TeacherStudentsClient'
import styles from '@/app/phase4/phase4.module.css'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection, localeText } from '@/lib/locale'

export const dynamic = 'force-dynamic'

export default async function TeacherStudentsPage() {
  const language = await getServerLanguage()
  const access = await requirePermission('teacher.viewStudents')
  if (isNextResponse(access)) redirect('/auth/login')
  return <main className={styles.shell} dir={localeDirection(language)}><div className={styles.container}>
    <header className={styles.header}><div><div className={styles.eyebrow}>{localeText(language, 'مساحة المعلم', 'Teacher foundation')}</div><h1 className={styles.title}>{localeText(language, 'طلابي', 'My students')}</h1><p className={styles.muted}>{localeText(language, 'سجلات الطلاب والتوصيات بمستوياتهم.', 'Student records and level recommendations.')}</p></div><Phase4Nav area="teacher" /></header>
    <TeacherStudentsClient />
  </div></main>
}