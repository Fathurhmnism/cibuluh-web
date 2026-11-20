'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Ringkasan' },
  { href: '/admin/pesanan', label: 'Pesanan' },
  { href: '/admin/produk', label: 'Produk & Stok' },
]

export default function AdminNav() {
  const pathname = usePathname() ?? ''
  return (
    <nav className="flex gap-1 text-sm">
      {LINKS.map((l) => {
        const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 ${active ? 'bg-green-100 font-medium text-green-900' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
