'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const params = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      const next = params?.get('next')
      window.location.href = next && next.startsWith('/admin') ? next : '/admin'
      return
    }
    const data = await res.json().catch(() => ({}))
    setError(data.error || 'Login gagal')
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold text-green-900">Admin Cibulu Berdaya</h1>
        <p className="text-sm text-gray-500">Masuk untuk mengelola pesanan dan stok.</p>
      </div>
      <label className="block text-sm font-medium text-gray-700">
        Password
        <input
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20"
        />
      </label>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-lg bg-green-800 px-4 py-2 font-semibold text-white hover:bg-green-900 disabled:bg-gray-300"
      >
        {loading ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 text-gray-900">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
