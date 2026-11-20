import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_HOURS,
  createAdminToken,
  passwordMatches,
  sessionSecret,
} from '@/lib/adminSession'
import { readJson } from '@/lib/http'

export async function POST(request: NextRequest) {
  const secret = sessionSecret()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!secret || !adminPassword) {
    return NextResponse.json(
      { error: 'Login admin belum dikonfigurasi (ADMIN_PASSWORD & SESSION_SECRET)' },
      { status: 503 }
    )
  }

  const body = (await readJson(request)) as { password?: unknown } | null
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!(await passwordMatches(password, adminPassword))) {
    // Jeda kecil untuk memperlambat tebakan beruntun
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({ error: 'Password salah' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, await createAdminToken(secret), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_HOURS * 3600,
  })
  return response
}
