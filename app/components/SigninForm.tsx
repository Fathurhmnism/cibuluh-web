'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '../contexts/UserContext' // ✅ Import context user

const SigninForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { setUser } = useUser() // ✅ Ambil fungsi setUser dari context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email dan password wajib diisi.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format email tidak valid.')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Login gagal')
      } else {
        setSuccess('Login berhasil! Mengarahkan ke halaman utama...')

        // ✅ Simpan cookie
        document.cookie = `user=${encodeURIComponent(email)}; path=/`

        // ✅ Update state global
        setUser({ email })

        // ⏳ Redirect
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat login.')
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-[#1E1B2E] text-white">
      {/* Kiri: Gambar */}
      <div className="relative bg-black">
        <Image src="/ricefield.jpg" alt="Rice Field" fill className="object-cover opacity-40" />
      </div>

      {/* Kanan: Form */}
      <div className="flex flex-col justify-center px-10 py-12 bg-white text-black">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
        </div>

        <h1 className="text-3xl font-bold mb-2">Sign in to your account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Belum punya akun?{' '}
          <Link href="/signup" className="text-yellow-600 hover:underline">
            Buat akun
          </Link>
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

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
              autoComplete="current-password"
              required
            />
          </div>

          <div className="text-right mb-4 text-sm">
            <a href="#" className="text-yellow-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded shadow-md"
          >
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  )
}

export default SigninForm