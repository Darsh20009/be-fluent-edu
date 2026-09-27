import Link from 'next/link'
import styles from './phase4.module.css'

export function Phase4Nav({ area }: { area: 'admin' | 'teacher' | 'student' }) {
  const links = area === 'admin'
    ? [
        ['/dashboard/admin/classes', 'Classes'],
        ['/dashboard/admin/feedback', 'Feedback'],
        ['/dashboard/admin/homework', 'Homework'],
        ['/dashboard/admin/commerce', 'Control center'],
        ['/dashboard/admin/people', 'People'],
        ['/dashboard/admin/levels', 'Levels'],
        ['/dashboard/admin/intelligence', 'Learning intelligence'], ['/dashboard/admin', 'Legacy overview'],
      ]
    : area === 'teacher'
       ? [['/dashboard/teacher/classes', 'My classes'], ['/dashboard/teacher/feedback', 'Feedback'], ['/dashboard/teacher/homework', 'Homework'], ['/dashboard/teacher/students', 'My students'], ['/dashboard/teacher/intelligence', 'Learning intelligence'], ['/dashboard/teacher', 'Legacy dashboard']]
        : [['/dashboard/student/classes', 'My classes'], ['/dashboard/student/feedback', 'Feedback'], ['/dashboard/student/homework', 'Homework'], ['/dashboard/student/profile', 'My profile'], ['/dashboard/student/learning', 'My learning'], ['/dashboard/student', 'Legacy dashboard']]

  return <nav className={styles.nav} aria-label="Phase 4 navigation">
    {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
  </nav>
}