import { cookies } from 'next/headers'
import type { Language } from '@/lib/locale'

export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  return cookieStore.get('language')?.value === 'en' ? 'en' : 'ar'
}