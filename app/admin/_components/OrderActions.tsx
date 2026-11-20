'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { AdminAction } from '@/lib/orders/status'

const inputClass = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm'

export default function OrderActions({ orderNumber, actions }: { orderNumber: string; actions: AdminAction[] }) {
  const router = useRouter()
  const [awb, setAwb] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<AdminAction | null>(null)
  const [error, setError] = useState('')

  if (actions.length === 0) {
    return (
      <section className="rounded-xl bg-white p-5 text-sm text-gray-500 shadow-sm">
        Tidak ada aksi untuk status ini.
      </section>
    )
  }

  const run = async (action: AdminAction, body: Record<string, string>) => {
    if (action === 'cancel' && !confirm('Batalkan pesanan ini? Stok akan dikembalikan.')) return
    setBusy(action)
    setError('')
    const res = await fetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(null)
    if (!res.ok) {
      setError(data.error || 'Aksi gagal')
      return
    }
    setAwb('')
    setNote('')
    router.refresh()
  }

  return (
    <section className="space-y-4 rounded-xl bg-white p-5 text-sm shadow-sm">
      <h2 className="font-semibold">Proses pesanan</h2>

      {actions.includes('ship') && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            run('ship', { awb })
          }}
        >
          <label className="block text-gray-700">
            Nomor resi
            <input required minLength={5} value={awb} onChange={(e) => setAwb(e.target.value)} className={inputClass} />
          </label>
          <button
            disabled={busy !== null}
            className="mt-2 w-full rounded-lg bg-green-800 px-3 py-2 font-medium text-white hover:bg-green-900 disabled:bg-gray-300"
          >
            {busy === 'ship' ? 'Menyimpan…' : 'Tandai dikirim'}
          </button>
        </form>
      )}

      {actions.includes('complete') && (
        <button
          onClick={() => run('complete', {})}
          disabled={busy !== null}
          className="w-full rounded-lg bg-green-800 px-3 py-2 font-medium text-white hover:bg-green-900 disabled:bg-gray-300"
        >
          {busy === 'complete' ? 'Menyimpan…' : 'Tandai selesai (sudah diterima)'}
        </button>
      )}

      {actions.includes('cancel') && (
        <form
          className="border-t pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            run('cancel', { note })
          }}
        >
          <label className="block text-gray-700">
            Alasan pembatalan
            <input required minLength={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </label>
          <button
            disabled={busy !== null}
            className="mt-2 w-full rounded-lg border border-red-300 px-3 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {busy === 'cancel' ? 'Membatalkan…' : 'Batalkan pesanan'}
          </button>
          <p className="mt-1 text-xs text-gray-500">Stok dikembalikan otomatis. Refund untuk pesanan yang sudah dibayar dilakukan manual.</p>
        </form>
      )}

      {error && <p className="rounded bg-red-50 p-2 text-red-700">{error}</p>}
    </section>
  )
}
