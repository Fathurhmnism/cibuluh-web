'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const field = 'mt-1 block rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm'

export default function StockForm({ varieties }: { varieties: { id: string; name: string }[] }) {
  const router = useRouter()
  const [varietyId, setVarietyId] = useState(varieties[0]?.id ?? '')
  const [reason, setReason] = useState<'RESTOCK' | 'PENYESUAIAN'>('RESTOCK')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const res = await fetch('/api/admin/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ varietyId, reason, deltaKg: Number(amount), note: note || undefined }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setMessage({ ok: false, text: data.error || 'Gagal menyimpan' })
      return
    }
    setMessage({ ok: true, text: `Tersimpan. Stok sekarang ${data.stockKg} kg.` })
    setAmount('')
    setNote('')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-lg bg-stone-50 p-3">
      <label className="text-xs text-gray-500">
        Jenis beras
        <select value={varietyId} onChange={(e) => setVarietyId(e.target.value)} className={field}>
          {varieties.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-gray-500">
        Jenis mutasi
        <select value={reason} onChange={(e) => setReason(e.target.value as typeof reason)} className={field}>
          <option value="RESTOCK">Restock (masuk)</option>
          <option value="PENYESUAIAN">Penyesuaian (±)</option>
        </select>
      </label>
      <label className="text-xs text-gray-500">
        Jumlah (kg){reason === 'PENYESUAIAN' ? ' — negatif untuk mengurangi' : ''}
        <input
          required
          type="number"
          step="0.1"
          min={reason === 'RESTOCK' ? 0.1 : undefined}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${field} w-40`}
        />
      </label>
      <label className="text-xs text-gray-500">
        Catatan
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. Panen Nov / susut" className={`${field} w-56`} />
      </label>
      <button disabled={busy} className="rounded-lg bg-green-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-900 disabled:bg-gray-300">
        {busy ? 'Menyimpan…' : 'Simpan mutasi'}
      </button>
      {message && <p className={`w-full text-sm ${message.ok ? 'text-green-800' : 'text-red-700'}`}>{message.text}</p>}
    </form>
  )
}
