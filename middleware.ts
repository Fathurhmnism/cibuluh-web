import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, sessionSecret, verifyAdminToken } from './lib/adminSession'

// Lindungi semua halaman /admin dan API /api/admin, kecuali halaman & API login.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const secret = sessionSecret()
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const authorized = secret ? await verifyAdminToken(token, secret) : false

  if (authorized) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Sesi admin tidak valid' }, { status: 401 })
  }
  const loginUrl = new URL('/admin/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
