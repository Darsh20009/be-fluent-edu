import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './phase4.module.css'

export function Phase4Nav({ area }: { area: 'admin' | 'manager' | 'teacher' | 'student' }) {
  const adminLinks = [
    ['/dashboard/admin/classes', 'Classes'],
    ['/dashboard/admin/feedback', 'Feedback'],
    ['/dashboard/admin/homework', 'Homework'],
    ['/dashboard/admin/commerce', 'Control center'],
    ['/dashboard/admin/people', 'People'],
    ['/dashboard/admin/levels', 'Levels'],
    ['/dashboard/admin/intelligence', 'Learning intelligence'],
    ['/dashboard/admin/speaking', 'Community'],
    ['/dashboard/admin/whatsapp', 'Communication'],
  ] as const

  const links = area === 'admin'
    ? [...adminLinks, ['/dashboard/admin', 'Legacy overview'] as const]
    : area === 'manager'
      ? adminLinks
    : area === 'teacher'
       ? [
           ['/dashboard/teacher/classes', 'My classes'],
           ['/dashboard/teacher/classes?view=QMeet', 'QMeet'],
           ['/dashboard/teacher/feedback', 'Feedback'],
           ['/dashboard/teacher/homework', 'Homework'],
           ['/dashboard/teacher/students', 'My students'],
           ['/dashboard/teacher/intelligence', 'Learning intelligence'],
           ['/dashboard/teacher/speaking', 'Speaking'],
           ['/dashboard/teacher', 'Legacy dashboard'],
         ]
        : [
            ['/dashboard/student', 'Home'],
            ['/dashboard/student/classes', 'My classes'],
            ['/dashboard/student/learning', 'My learning'],
            ['/dashboard/student/learning?view=Goals', 'Goals'],
            ['/dashboard/student/homework', 'Homework'],
            ['/dashboard/student/feedback', 'Feedback'],
            ['/dashboard/student/speaking', 'Speaking rooms'],
            ['/dashboard/student/profile', 'Profile'],
          ]

  const labels = {
    admin: 'Admin navigation',
    manager: 'Manager navigation',
    teacher: 'Teacher navigation',
    student: 'Student navigation',
  }

  return <nav className={styles.nav} aria-label={labels[area]}>
    {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
    <ThemeToggle />
  </nav>
}