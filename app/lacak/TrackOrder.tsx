'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import OrderStatusSteps from '../components/OrderStatusSteps'
import { payWithSnap } from '../components/checkout/snap'
import { formatDateTime, formatKg, formatRupiah } from '@/lib/format'
import { STATUS_LABEL } from '@/lib/orders/status'
import type { PublicOrder } from '@/lib/orders/view'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20'

export default function TrackOrder() {
  const params = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(params?.get('no') ?? '')
  const [email, setEmail] = useState(params?.get('email') ?? '')
  const [order, setOrder] = useState<PublicOrder | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  const lookup = useCallback(async (no: string, mail: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: no, email: mail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Pesanan tidak ditemukan')
      setOrder(data.order)
    } catch (err) {
      setOrder(null)
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const no = params?.get('no')
    const mail = params?.get('email')
    if (no && mail) lookup(no, mail)
  }, [params, lookup])

  const handlePay = async () => {
    if (!order) return
    setPaying(true)
    setError('')
    try {
      if (order.payment.provider === 'simulasi') {
        const res = await fetch('/api/orders/simulate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: order.orderNumber, email: order.customer.email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Pembayaran gagal')
      } else if (order.payment.token) {
        await payWithSnap(order.payment.token)
      }
      await lookup(order.orderNumber, order.customer.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pembayaran gagal')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault()
          lookup(orderNumber, email)
        }}
      >
        <label className="block text-sm font-medium text-gray-700">
          Nomor pesanan
          <input
            required
            placeholder="CB-20261120-0001"
            className={inputClass}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-800 px-5 py-2 font-semibold text-white hover:bg-green-900 disabled:bg-gray-300"
        >
          {loading ? 'Mencari…' : 'Lacak'}
        </button>
      </form>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {order && (
        <article className="space-y-6 rounded-xl bg-white p-5 shadow-sm">
          <header className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-gray-500">Nomor pesanan</p>
              <p className="text-xl font-semibold">{order.orderNumber}</p>
              <p className="text-sm text-gray-500">Dibuat {formatDateTime(order.createdAt)}</p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-900">
              {STATUS_LABEL[order.status]}
            </span>
          </header>

          <OrderStatusSteps status={order.status} />

          {order.status === 'BELUM_BAYAR' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-900">Menunggu pembayaran {formatRupiah(order.total)}</p>
              <p className="mb-3 text-sm text-amber-800">
                Bayar sebelum {formatDateTime(order.expiresAt)} WIB atau pesanan dibatalkan otomatis.
              </p>
              <button
                onClick={handlePay}
                disabled={paying}
                className="rounded-lg bg-green-800 px-5 py-2 font-semibold text-white hover:bg-green-900 disabled:bg-gray-300"
              >
                {paying ? 'Memproses…' : order.payment.provider === 'simulasi' ? 'Bayar (simulasi)' : 'Bayar sekarang'}
              </button>
              {order.payment.provider === 'simulasi' && (
                <p className="mt-2 text-xs text-amber-800">
                  Mode demo: pembayaran disimulasikan, tidak ada uang yang ditarik.
                </p>
              )}
            </div>
          )}

          {order.tracking && (
            <div className="rounded-lg bg-stone-50 p-4 text-sm">
              <p className="text-gray-500">Nomor resi {order.shipping.courierName}</p>
              <p className="text-lg font-semibold tracking-wide">{order.tracking.awb}</p>
            </div>
          )}

          <section>
            <h2 className="mb-2 font-semibold">Produk</h2>
            <ul className="divide-y text-sm">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between py-2">
                  <span>
                    {item.name} × {item.quantity}
                    {item.unit === 'kg' ? ' kg' : ''}
                  </span>
                  <span className="tabular-nums">{formatRupiah(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal ({formatKg(order.weightKg)})</dt>
                <dd className="tabular-nums">{formatRupiah(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">
                  Ongkir {order.shipping.courierName} {order.shipping.service} ({order.shipping.etd})
                </dt>
                <dd className="tabular-nums">{formatRupiah(order.shipping.cost)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatRupiah(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="text-sm">
            <h2 className="mb-2 font-semibold">Dikirim ke</h2>
            <p>
              {order.customer.name} · {order.customer.phone}
            </p>
            <p className="text-gray-600">
              {order.address.street}, Kec. {order.address.districtName}, {order.address.regencyName},{' '}
              {order.address.provinceName} {order.address.postalCode}
            </p>
          </section>

          <section className="text-sm">
            <h2 className="mb-2 font-semibold">Riwayat</h2>
            <ol className="space-y-2 border-l-2 border-green-800/30 pl-4">
              {[...order.history].reverse().map((h, i) => (
                <li key={i}>
                  <p className="font-medium">{STATUS_LABEL[h.status]}</p>
                  <p className="text-gray-500">
                    {formatDateTime(h.at)}
                    {h.note ? ` · ${h.note}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </article>
      )}
    </div>
  )
}
