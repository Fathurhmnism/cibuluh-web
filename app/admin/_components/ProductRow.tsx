'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatRupiah } from '@/lib/format'

type Row = {
  id: string
  name: string
  kind: 'pack' | 'bulk'
  variety: string
  unit: string
  price: number
  active: boolean
}

export default function ProductRow({ product }: { product: Row }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [price, setPrice] = useState(String(product.price))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async (body: Record<string, unknown>) => {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setError(data.error || 'Gagal menyimpan')
      return
    }
    setEditing(false)
    router.refresh()
  }

  const priceKey = product.kind === 'pack' ? 'price' : 'pricePerKg'

  return (
    <tr className="border-t align-top">
      <td className="px-4 py-2 font-medium">{product.name}</td>
      <td className="px-4 py-2 text-gray-600">{product.variety}</td>
      <td className="px-4 py-2 text-gray-600">{product.unit}</td>
      <td className="px-4 py-2">
        {editing ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              save({ [priceKey]: Number(price) })
            }}
          >
            <input
              type="number"
              min={1000}
              step={500}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-28 rounded border border-gray-300 px-2 py-1"
              aria-label="Harga baru"
            />
            <button disabled={busy} className="text-green-800 hover:underline">
              Simpan
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-gray-500 hover:underline">
              Batal
            </button>
          </form>
        ) : (
          <span className="tabular-nums">
            {formatRupiah(product.price)}
            {product.kind === 'bulk' ? ' / kg' : ''}
          </span>
        )}
        {error && <p className="text-xs text-red-700">{error}</p>}
      </td>
      <td className="px-4 py-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={product.active}
            disabled={busy}
            onChange={(e) => save({ active: e.target.checked })}
            className="accent-green-800"
          />
          <span className="text-gray-600">{product.active ? 'Tampil' : 'Disembunyikan'}</span>
        </label>
      </td>
      <td className="px-4 py-2 text-right">
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-green-800 hover:underline">
            Ubah harga
          </button>
        )}
      </td>
    </tr>
  )
}
