import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import { connectToDatabase } from '@/lib/mongodb'

// Catatan: sesi masih berupa cookie email polos. Akan diganti session bertanda
// tangan + role (pembeli/admin) di Tahap 3.
export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string
    password?: string
  }

  if (!email || !password) {
    return NextResponse.json({ message: 'Email dan password wajib diisi' }, { status: 400 })
  }

  try {
    const db = await connectToDatabase()
    const user = await db.collection('users').findOne({ email })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Email atau password salah' }, { status: 401 })
    }

    const res = NextResponse.json({ message: 'Login berhasil' })
    res.headers.set(
      'Set-Cookie',
      serialize('user', email, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
      })
    )
    return res
  } catch (error) {
    console.error('Gagal login:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
