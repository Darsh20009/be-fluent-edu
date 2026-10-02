import { existsSync } from 'node:fs'
import path from 'node:path'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getServerLanguage } from '@/lib/server-locale'
import { canAccessTips, TIPS_REGISTRY } from '@/lib/tips/registry'
import { getTipsReadiness } from '@/lib/tips/readiness'
import TipsGuide from './TipsGuide'

export const dynamic = 'force-dynamic'

export default async function AdminTipsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (!canAccessTips(session.user.role)) redirect('/dashboard')

  const language = await getServerLanguage()
  const readiness = await getTipsReadiness()
  const screenshots = TIPS_REGISTRY.flatMap(({ slug }) => {
    const filePath = path.join(process.cwd(), 'public', 'tips', 'screens', `${slug}.png`)
    return existsSync(filePath) ? [slug] : []
  })

  return <TipsGuide language={language} screenshotSlugs={screenshots} readiness={readiness} />
}