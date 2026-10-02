'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { localeText } from '@/lib/locale'
import styles from './phase4.module.css'

export function Phase4Nav({ area }: { area: 'admin' | 'manager' | 'teacher' | 'student' }) {
  const { language } = useTheme()
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
    ? [[ '/dashboard/admin/tips', localeText(language, 'دليل النظام', 'System guide') ] as const, ...adminLinks, ['/dashboard/admin', 'Legacy overview'] as const]
    : area === 'manager'
      ? adminLinks.map(([href, label], index) => [
          href,
          localeText(language, ['الحصص', 'ملاحظات الحصص', 'الواجبات', 'مركز التحكم', 'الأشخاص', 'المستويات', 'ذكاء التعلّم', 'المجتمع', 'التواصل'][index], label),
        ] as const)
    : area === 'teacher'
       ? [
           ['/dashboard/teacher/classes', localeText(language, 'حصصي', 'My classes')],
           ['/dashboard/teacher/classes?view=QMeet', 'QMeet'],
           ['/dashboard/teacher/feedback', localeText(language, 'ملاحظات الحصص', 'Feedback')],
           ['/dashboard/teacher/homework', localeText(language, 'الواجبات', 'Homework')],
           ['/dashboard/teacher/students', localeText(language, 'طلابي', 'My students')],
           ['/dashboard/teacher/intelligence', localeText(language, 'ذكاء التعلّم', 'Learning intelligence')],
           ['/dashboard/teacher/speaking', localeText(language, 'التحدث', 'Speaking')],
           ['/dashboard/teacher', localeText(language, 'لوحة المعلم', 'Teacher dashboard')],
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
    manager: localeText(language, 'تنقل المدير', 'Manager navigation'),
    teacher: localeText(language, 'تنقل المعلم', 'Teacher navigation'),
    student: 'Student navigation',
  }

  return <nav className={styles.nav} aria-label={labels[area]}>
    {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
    {(area === 'manager' || area === 'teacher') && <LanguageToggle />}
    <ThemeToggle />
  </nav>
}