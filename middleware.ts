import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PAGE_PREFIXES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
]

function isPublicApi(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const phase5RoutePrefixes = [
    '/api/admin/commerce/',
    '/api/admin/enrollments',
    '/api/admin/groups',
    '/api/student/commercial',
    '/api/teacher/groups',
  ]
  // Phase 5 handlers apply the database gate before their own auth checks so
  // blocked infrastructure is reported truthfully without weakening RBAC.
  if (phase5RoutePrefixes.some((prefix) => pathname.startsWith(prefix))) return true
  if (pathname.startsWith('/api/auth/')) return true
  if (pathname === '/api/health') return request.method === 'GET'
  if (pathname === '/api/packages' || pathname.startsWith('/api/packages/')) {
    return request.method === 'GET'
  }
  if (pathname === '/api/coupons/active') return request.method === 'GET'
  if (pathname === '/api/book-trial') return request.method === 'POST'
  if (pathname === '/api/contact') return request.method === 'POST'
  if (pathname === '/api/translate' || pathname === '/api/grammar-check') {
    return request.method === 'POST'
  }
  if (pathname === '/api/words/categories') return request.method === 'GET'
  if (pathname === '/api/auth') return true
  if (searchParams.get('public') === 'true') return false
  return false
}

function isUsableToken(token: Awaited<ReturnType<typeof getToken>>) {
  if (!token || typeof token === 'string') return false
  const claims = token as Record<string, unknown>
  if (claims.revoked === true) return false
  if (claims.isActive === false) return false
  if (
    claims.status === 'SUSPENDED' ||
    claims.status === 'DISABLED' ||
    claims.status === 'PENDING'
  ) {
    return false
  }
  return true
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')
  const isDashboard = pathname.startsWith('/dashboard')

  if (isApi && isPublicApi(request)) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET,
  })

  if (isApi) {
    if (!isUsableToken(token)) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 },
      )
    }
    return NextResponse.next()
  }

  if (isDashboard && !isUsableToken(token)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}