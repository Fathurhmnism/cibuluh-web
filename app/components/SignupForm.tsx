'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Mail, User, Lock } from 'lucide-react'
import Link from 'next/link'

const SignupForm = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setSuccess('')

  if (!email || !username || !password) {
    setError('Semua field wajib diisi.')
    return
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    setError('Email tidak valid.')
    return
  }

  if (password.length < 6) {
    setError('Password minimal 6 karakter.')
    return
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || 'Signup gagal')
    } else {
      setSuccess('Signup berhasil! Mengarahkan ke halaman login...')
      setEmail('')
      setUsername('')
      setPassword('')
      setTimeout(() => {
        window.location.href = '/signin'
      }, 1500)
    }
  } catch (err) {
    console.error(err)
    setError('Terjadi kesalahan server.')
  }
}

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#1E1B2E] text-white">
      {/* Kiri: Gambar dengan teks */}
      <div className="relative flex flex-col justify-between p-8 bg-black">
        <Image src="/ricefield.jpg" alt="Rice Field" fill className="object-cover opacity-40" />
        <div className="relative z-10 text-white text-center"></div>
      </div>

      {/* Kanan: Form */}
      <div className="flex flex-col justify-center px-10 py-12 bg-white text-black">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Already have an account?{' '}
          <Link href="/signin" className="text-yellow-600 hover:underline">
            Log in
          </Link>
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <div className="flex items-center border border-gray-300 rounded px-3 py-2">
            <User className="text-gray-500 mr-2" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full outline-none text-black placeholder-gray-400"
              autoComplete="username"
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded px-3 py-2">
            <Mail className="text-gray-500 mr-2" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full outline-none text-black placeholder-gray-400"
              autoComplete="email"
              required
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded px-3 py-2">
            <Lock className="text-gray-500 mr-2" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full outline-none text-black placeholder-gray-400"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <label className="flex items-center text-sm">
            <input type="checkbox" required className="mr-2" />
            I agree to the{' '}
            <a href="#" className="text-yellow-600 hover:underline ml-1">
              Terms & Conditions
            </a>
          </label>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded shadow-md"
          >
            SIGN UP
          </button>
        </form>

        <div className="my-6 text-center text-sm text-gray-400">or register with</div>

        <div className="flex gap-4">
          <button className="flex-1 bg-black text-white p-2 rounded flex items-center justify-center gap-2">
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} /> Google
          </button>
          <button className="flex-1 bg-black text-white p-2 rounded flex items-center justify-center gap-2">
            <Image src="/icons/apple.svg" alt="Apple" width={20} height={20} /> Apple
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupForm