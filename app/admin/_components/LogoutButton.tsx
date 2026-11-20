'use client'

export default function LogoutButton() {
  return (
    <button
      className="text-gray-600 hover:text-red-700"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        window.location.href = '/admin/login'
      }}
    >
      Keluar
    </button>
  )
}
