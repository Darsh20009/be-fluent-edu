import { TeacherIntelligence } from '@/app/dashboard/phase9/IntelligenceClient'
import { Phase4Nav } from '@/app/phase4/nav'
import styles from '@/app/phase4/phase4.module.css'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection } from '@/lib/locale'
export default async function Page(){const language = await getServerLanguage();return <div dir={localeDirection(language)}><div className={`${styles.container} py-4`}><Phase4Nav area="teacher" /></div><TeacherIntelligence/></div>}