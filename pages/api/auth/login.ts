import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../../../lib/mongodb'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const db = await connectToDatabase()

  const user = await db.collection('users').findOne({ email })
  if (!user) {
    return res.status(401).json({ message: 'User tidak ditemukan' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Password salah' })
  }

  // Optional: Simpan cookie agar bisa diakses server-side (misalnya di dashboard)
  res.setHeader('Set-Cookie', serialize('user', email, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 hari
  }))

  return res.status(200).json({ message: 'Login berhasil' })
}