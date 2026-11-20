import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string
    password?: string
  }

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { message: 'Email wajib diisi dan password minimal 6 karakter' },
      { status: 400 }
    )
  }

  try {
    const db = await connectToDatabase()

    if (await db.collection('users').findOne({ email })) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 })
    }

    await db.collection('users').insertOne({
      email,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    })

    return NextResponse.json({ message: 'Akun berhasil dibuat' }, { status: 201 })
  } catch (error) {
    console.error('Gagal daftar:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
