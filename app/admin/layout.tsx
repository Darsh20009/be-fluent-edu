import type { ReactNode } from 'react'
import { getServerLanguage } from '@/lib/server-locale'
import { localeDirection } from '@/lib/locale'
import AdminLocaleShell from './AdminLocaleShell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const language = await getServerLanguage()
  return <div dir={localeDirection(language)}><AdminLocaleShell>{children}</AdminLocaleShell></div>
}