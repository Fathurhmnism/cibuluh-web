// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const email = localStorage.getItem('user')
    if (email) setUserEmail(email)
  }, [])

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-black">Dashboard</h1>
      {userEmail ? (
        <p className="text-lg text-gray-800">Selamat datang, <strong>{userEmail}</strong>!</p>
      ) : (
        <p className="text-red-500">Kamu belum login.</p>
      )}
    </div>
  )
}