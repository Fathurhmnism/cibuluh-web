/**
 * Test integrasi alur pesanan terhadap MongoDB sungguhan (butuh replica set
 * untuk transaksi). Dilewati bila MONGODB_URI_TEST tidak diatur.
 *   MONGODB_URI_TEST="mongodb://127.0.0.1:27017/?replicaSet=rs0" npm test
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const uri = process.env.MONGODB_URI_TEST

describe.skipIf(!uri)('alur pesanan (integrasi)', () => {
  let service: typeof import('@/lib/orders/service')
  let store: typeof import('@/lib/store')

  const checkout = (overrides: Partial<import('@/lib/orders/service').CheckoutInput> = {}) => ({
    items: [
      { productId: 'premium-5kg', quantity: 2 },
      { productId: 'premium-curah', quantity: 3 },
    ],
    customer: { name: 'Budi', email: 'budi@contoh.id', phone: '081234567890' },
    address: { districtCode: '31.71.01', street: 'Jl. Merdeka No. 1, RT 01/RW 02', postalCode: '10110' },
    shipping: { courier: 'jne', service: 'REG' },
    ...overrides,
  })

  beforeAll(async () => {
    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB = `cibulu_test_${Date.now()}`
    process.env.PAYMENT_PROVIDER = 'simulasi'
    service = await import('@/lib/orders/service')
    store = await import('@/lib/store')
  })

  beforeEach(async () => {
    const { varieties } = await store.getStore()
    await varieties.updateOne({ _id: 'premium' }, { $set: { stockKg: 500 } })
  })

  afterAll(async () => {
    const { db } = await store.getStore()
    await db.dropDatabase()
    const { getClient } = await import('@/lib/mongodb')
    await (await getClient()).close()
  })

  const stockOf = async (id: string) => (await (await store.getStore()).varieties.findOne({ _id: id }))!.stockKg

  it('checkout: harga & ongkir dihitung server, stok dipesan, nomor pesanan berurutan', async () => {
    const a = await service.createOrder(checkout())
    const b = await service.createOrder(checkout())
    expect(a.orderNumber).toMatch(/^CB-\d{8}-\d{4}$/)
    expect(Number(b.orderNumber.slice(-4))).toBe(Number(a.orderNumber.slice(-4)) + 1)
    expect(a.subtotal).toBe(2 * 88000 + 3 * 17000)
    expect(a.total).toBe(a.subtotal + a.shipping.cost)
    expect(a.status).toBe('BELUM_BAYAR')
    expect(await stockOf('premium')).toBe(500 - 13 * 2)
  })

  it('menolak checkout bila stok tidak cukup dan tidak mengubah stok', async () => {
    const { varieties } = await store.getStore()
    await varieties.updateOne({ _id: 'premium' }, { $set: { stockKg: 12 } })
    await expect(service.createOrder(checkout())).rejects.toThrow(/tidak cukup/)
    expect(await stockOf('premium')).toBe(12)
  })

  it('checkout bersamaan tidak membuat stok minus', async () => {
    const { varieties } = await store.getStore()
    await varieties.updateOne({ _id: 'premium' }, { $set: { stockKg: 30 } })
    // 5 pesanan × 13 kg = 65 kg, stok hanya 30 → maksimal 2 berhasil
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => service.createOrder(checkout())))
    const ok = results.filter((r) => r.status === 'fulfilled').length
    expect(ok).toBe(2)
    expect(await stockOf('premium')).toBe(30 - ok * 13)
  })

  it('pembayaran → Dikemas → Dikirim (resi) → Selesai, tercatat di riwayat', async () => {
    const order = await service.createOrder(checkout())
    await service.applyPaymentOutcome(order.orderNumber, 'paid', { status: 'settlement' }, 'midtrans')
    // Notifikasi ganda tidak mengubah apa pun (idempoten)
    await service.applyPaymentOutcome(order.orderNumber, 'paid', { status: 'settlement' }, 'midtrans')

    expect(await service.completeOrder(order.orderNumber)).toBe(false) // belum dikirim
    expect(await service.shipOrder(order.orderNumber, 'JNE1234567')).toBe(true)
    expect(await service.completeOrder(order.orderNumber)).toBe(true)

    const final = await service.lookupOrder(order.orderNumber, 'budi@contoh.id')
    expect(final!.status).toBe('SELESAI')
    expect(final!.tracking!.awb).toBe('JNE1234567')
    expect(final!.history.map((h) => h.status)).toEqual(['BELUM_BAYAR', 'DIKEMAS', 'DIKIRIM', 'SELESAI'])
  })

  it('pembatalan mengembalikan stok tepat sekali', async () => {
    const order = await service.createOrder(checkout())
    expect(await stockOf('premium')).toBe(487)
    await service.cancelOrder(order.orderNumber, { by: 'admin', note: 'Permintaan pembeli' })
    await service.cancelOrder(order.orderNumber, { by: 'admin', note: 'Klik ganda' })
    await service.applyPaymentOutcome(order.orderNumber, 'failed', { status: 'expire' }, 'midtrans')
    expect(await stockOf('premium')).toBe(500)
  })

  it('pesanan kedaluwarsa dibatalkan otomatis dan stok kembali', async () => {
    const order = await service.createOrder(checkout())
    const { orders } = await store.getStore()
    await orders.updateOne({ orderNumber: order.orderNumber }, { $set: { expiresAt: new Date(Date.now() - 1000) } })
    expect(await service.expireStaleOrders()).toBeGreaterThanOrEqual(1)
    expect((await orders.findOne({ orderNumber: order.orderNumber }))!.status).toBe('DIBATALKAN')
    expect(await stockOf('premium')).toBe(500)
  })

  it('pembayaran untuk pesanan yang sudah batal ditandai perlu refund', async () => {
    const order = await service.createOrder(checkout())
    await service.cancelOrder(order.orderNumber, { by: 'sistem', note: 'Kedaluwarsa' })
    await service.applyPaymentOutcome(order.orderNumber, 'paid', { status: 'settlement' }, 'midtrans')
    const { orders } = await store.getStore()
    const saved = await orders.findOne({ orderNumber: order.orderNumber })
    expect(saved!.status).toBe('DIBATALKAN')
    expect(saved!.payment.needsRefund).toBe(true)
  })

  it('lacak pesanan wajib email yang cocok', async () => {
    const order = await service.createOrder(checkout())
    expect(await service.lookupOrder(order.orderNumber, 'orang@lain.id')).toBeNull()
    expect(await service.lookupOrder(order.orderNumber, 'budi@contoh.id')).not.toBeNull()
  })

  it('stok manual tidak boleh menjadi minus', async () => {
    await expect(
      service.adjustStock({ varietyId: 'premium', deltaKg: -600, reason: 'PENYESUAIAN' })
    ).rejects.toThrow(/tidak mencukupi/)
    const v = await service.adjustStock({ varietyId: 'premium', deltaKg: 50, reason: 'RESTOCK', note: 'Panen' })
    expect(v.stockKg).toBe(550)
  })
})
