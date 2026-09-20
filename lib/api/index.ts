import { NextResponse } from 'next/server'
import { apiError, apiSuccess } from '@/lib/errors'
import { requireSession } from '@/lib/auth-helpers'

export { apiError, apiSuccess }

export async function requireApiSession() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    )
  }
  return session
}
