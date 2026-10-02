'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import TeacherWorkspaceShell from './TeacherWorkspaceShell'

export default function TeacherRouteLayout({
  user,
  children,
}: {
  user: { name: string; email: string; role: string }
  children: ReactNode
}) {
  if (usePathname() === '/dashboard/teacher') return children
  return <TeacherWorkspaceShell user={user}>{children}</TeacherWorkspaceShell>
}