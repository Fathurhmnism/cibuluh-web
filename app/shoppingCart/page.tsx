'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '../contexts/cartContext'
import AddressPicker from '../components/checkout/AddressPicker'
import { payWithSnap } from '../components/checkout/snap'
import Navbar from '../components/Navbar'
import { formatKg, formatRupiah } from '@/lib/format'
import type { ShippingRate } from '@/lib/shipping/types'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20'

type Quote = { subtotal: number; weightKg: number; rates: ShippingRate[]; provider: string }

export default function ShoppingCartPage() {
  const router = useRouter()
  const { cartItems, ready, setQuantity, removeFromCart, clearCart, subtotal, weightKg } = useCart()

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [districtCode, setDistrictCode] = useState<string | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteError, setQuoteError] = useState('')
  const [loadingRates, setLoadingRates] = useState(false)
  const [selectedRate, setSelectedRate] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const items = cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  const itemsKey = JSON.stringify(items)

  const onDistrictChange = useCallback((code: string | null) => setDistrictCode(code), [])

  // Hitung ongkir setiap kali alamat atau isi keranjang berubah
  useEffect(() => {
    setQuote(null)
    setSelectedRate('')
    setQuoteError('')
    if (!districtCode || cartItems.length === 0) return

    const controller = new AbortController()
    setLoadingRates(true)
    fetch('/api/shipping/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districtCode, items: JSON.parse(itemsKey) }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Gagal menghitung ongkir')
        setQuote(data)
        if (data.rates[0]) setSelectedRate(`${data.rates[0].courier}:${data.rates[0].service}`)
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setQuoteError(e.message)
      })
      .finally(() => setLoadingRates(false))
    return () => controller.abort()
  }, [districtCode, itemsKey, cartItems.length])

  const rate = quote?.rates.find((r) => `${r.courier}:${r.service}` === selectedRate) ?? null
  const serverSubtotal = quote?.subtotal ?? subtotal
  const total = serverSubtotal + (rate?.cost ?? 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!rate || !districtCode) {
      setError('Lengkapi alamat dan pilih layanan pengiriman.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer,
          address: { districtCode, street, postalCode },
          shipping: { courier: rate.courier, service: rate.service },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout gagal')

      clearCart()
      const trackUrl = `/lacak?no=${encodeURIComponent(data.orderNumber)}&email=${encodeURIComponent(data.email)}`
      if (data.token) {
        await payWithSnap(data.token).catch(() => 'error')
      }
      router.push(trackUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout gagal')
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden bg-stone-50 px-4 pb-16 pt-28 text-gray-900">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-semibold text-green-900">Keranjang</h1>

          {!ready ? null : cartItems.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <p className="mb-4 text-gray-600">Keranjangmu masih kosong.</p>
              <Link href="/?scroll=Product" className="font-semibold text-green-800 underline">
                Lihat produk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="min-w-0 space-y-6">
                {/* Isi keranjang */}
                <section className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Produk</h2>
                  <ul className="divide-y">
                    {cartItems.map((item) => (
                      <li key={item.productId} className="flex gap-4 py-4">
                        <Image src={item.image} alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatRupiah(item.unitPrice)}
                                {item.kind === 'bulk' ? ' / kg' : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label={`Hapus ${item.name}`}
                              onClick={() => removeFromCart(item.productId)}
                              className="shrink-0"
                            >
                              <X className="h-5 w-5 text-red-500 hover:text-red-700" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Kurangi"
                                className="rounded border p-1 hover:bg-gray-100"
                                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-14 text-center tabular-nums">
                                {item.quantity}
                                {item.kind === 'bulk' ? ' kg' : ''}
                              </span>
                              <button
                                type="button"
                                aria-label="Tambah"
                                className="rounded border p-1 hover:bg-gray-100 disabled:opacity-40"
                                disabled={item.quantity >= item.maxQuantity}
                                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="font-medium tabular-nums">{formatRupiah(item.unitPrice * item.quantity)}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-right text-sm text-gray-500">Total berat {formatKg(weightKg)}</p>
                </section>

                {/* Data pembeli */}
                <section className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-1 text-lg font-semibold">Data Pembeli</h2>
                  <p className="mb-4 text-sm text-gray-500">
                    Tanpa perlu daftar akun. Nomor pesanan dan email dipakai untuk melacak pesanan.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Nama lengkap
                      <input
                        required
                        className={inputClass}
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                      <input
                        required
                        type="email"
                        className={inputClass}
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      No. HP / WhatsApp
                      <input
                        required
                        inputMode="tel"
                        placeholder="0812xxxxxxxx"
                        className={inputClass}
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      />
                    </label>
                  </div>
                </section>

                {/* Alamat */}
                <section className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Alamat Pengiriman</h2>
                  <AddressPicker onChange={onDistrictChange} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_140px]">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat lengkap
                      <input
                        required
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                        className={inputClass}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Kode pos
                      <input
                        required
                        inputMode="numeric"
                        pattern="\d{5}"
                        maxLength={5}
                        className={inputClass}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </label>
                  </div>
                </section>

                {/* Pengiriman */}
                <section className="rounded-xl bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-semibold">Pengiriman</h2>
                  {!districtCode ? (
                    <p className="text-sm text-gray-500">Pilih kecamatan tujuan untuk melihat ongkir.</p>
                  ) : loadingRates ? (
                    <p className="text-sm text-gray-500">Menghitung ongkir…</p>
                  ) : quoteError ? (
                    <p className="text-sm text-red-600">{quoteError}</p>
                  ) : (
                    <div className="space-y-2">
                      {quote?.rates.map((r) => {
                        const key = `${r.courier}:${r.service}`
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                              selectedRate === key ? 'border-green-700 bg-green-50' : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="rate"
                              value={key}
                              checked={selectedRate === key}
                              onChange={() => setSelectedRate(key)}
                              className="accent-green-800"
                            />
                            <span className="flex-1">
                              <span className="font-medium">
                                {r.courierName} {r.service}
                              </span>{' '}
                              <span className="text-sm text-gray-500">
                                · {r.serviceName} · estimasi {r.etd}
                                {r.billableWeightKg > Math.ceil(weightKg) ? ` · dihitung ${r.billableWeightKg} kg` : ''}
                              </span>
                            </span>
                            <span className="font-medium tabular-nums">{formatRupiah(r.cost)}</span>
                          </label>
                        )
                      })}
                      {quote?.provider === 'simulasi' && (
                        <p className="pt-1 text-xs text-gray-500">
                          Ongkir memakai tarif simulasi (bukan tarif resmi kurir). Dikirim dari Jatiasih, Bekasi.
                        </p>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* Ringkasan */}
              <aside className="h-fit rounded-xl bg-white p-5 shadow-sm lg:sticky lg:top-28">
                <h2 className="mb-4 text-lg font-semibold">Ringkasan</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="tabular-nums">{formatRupiah(serverSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Ongkir</dt>
                    <dd className="tabular-nums">{rate ? formatRupiah(rate.cost) : '–'}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatRupiah(total)}</dd>
                  </div>
                </dl>
                {quote && quote.subtotal !== subtotal && (
                  <p className="mt-3 rounded bg-amber-50 p-2 text-xs text-amber-800">
                    Harga beberapa produk telah diperbarui. Total di atas adalah harga terbaru.
                  </p>
                )}
                {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting || !rate}
                  className="mt-5 w-full rounded-lg bg-green-800 px-4 py-3 font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submitting ? 'Memproses…' : 'Buat Pesanan & Bayar'}
                </button>
                <p className="mt-3 text-xs text-gray-500">
                  Selesaikan pembayaran dalam 24 jam, atau pesanan dibatalkan otomatis.
                </p>

                <div className="mt-6 border-t pt-4">
                  <p className="mb-2 text-sm font-semibold">Atau pesan lewat:</p>
                  <div className="flex items-center gap-3">
                    <a href="https://shopee.co.id/namatoko" target="_blank" rel="noopener noreferrer">
                      <Image src="/shopee-.png" alt="Shopee" width={64} height={32} />
                    </a>
                    <a href="https://www.tokopedia.com/cibulu-berdaya" target="_blank" rel="noopener noreferrer">
                      <Image src="/tokopedia.jpg" alt="Tokopedia" width={64} height={32} />
                    </a>
                    <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                      <Image src="/whatsapp.png" alt="WhatsApp" width={64} height={32} />
                    </a>
                  </div>
                </div>
              </aside>
            </form>
          )}
        </div>
      </main>
    </>
  )
}
