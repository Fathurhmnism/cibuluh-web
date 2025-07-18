import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  const db = await connectToDatabase()

  const existingUser = await db.collection('users').findOne({ email })
  if (existingUser) {
    return res.status(400).json({ message: 'Email sudah terdaftar' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.collection('users').insertOne({
    email,
    password: hashedPassword,
  })

  return res.status(201).json({ message: 'User created' })
}