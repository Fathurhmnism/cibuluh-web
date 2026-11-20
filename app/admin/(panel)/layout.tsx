import Link from 'next/link'
import AdminNav from '../_components/AdminNav'
import LogoutButton from '../_components/LogoutButton'

export const metadata = { title: 'Admin — Cibulu Berdaya', robots: { index: false } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <Link href="/admin" className="font-semibold text-green-900">
            Cibulu Admin
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Lihat toko ↗
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
