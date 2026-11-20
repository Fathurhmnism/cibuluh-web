import type { ClientSession } from 'mongodb'
import { getClient } from '../mongodb'
import { getStore } from '../store'
import { PricingError, priceCart, type CartInput } from '../pricing'
import { findRate, getShippingProvider } from '../shipping'
import { resolveDistrict } from '../wilayah'
import {
  createSnapTransaction,
  fetchTransactionStatus,
  interpretMidtransStatus,
  paymentMode,
  type PaymentOutcome,
} from '../payment'
import { PAYMENT_WINDOW_HOURS, adminTransition, type OrderStatus } from './status'
import type { Order, OrderHistoryEntry } from './types'

export class OrderError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
    this.name = 'OrderError'
  }
}

export type CheckoutInput = {
  items: CartInput[]
  customer: { name: string; email: string; phone: string }
  address: { districtCode: string; street: string; postalCode: string }
  shipping: { courier: string; service: string }
}

async function withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
  const client = await getClient()
  const session = client.startSession()
  try {
    let result!: T
    await session.withTransaction(async () => {
      result = await fn(session)
    })
    return result
  } finally {
    await session.endSession()
  }
}

/** Tanggal (zona Asia/Jakarta) dalam format YYYYMMDD */
function jakartaDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/-/g, '')
}

async function nextOrderNumber(now: Date) {
  const { counters } = await getStore()
  const key = jakartaDateKey(now)
  const counter = await counters.findOneAndUpdate(
    { _id: `order-${key}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  )
  return `CB-${key}-${String(counter!.seq).padStart(4, '0')}`
}

/** Hitung ulang keranjang + ongkir di server (dipakai saat cek ongkir & checkout) */
export async function quoteCart(items: CartInput[], districtCode: string) {
  const { products } = await getStore()
  const catalog = await products.find({ _id: { $in: items.map((i) => i.productId) } }).toArray()

  let priced
  try {
    priced = priceCart(items, catalog)
  } catch (error) {
    if (error instanceof PricingError) throw new OrderError(error.message)
    throw error
  }

  const address = resolveDistrict(districtCode)
  if (!address) throw new OrderError('Kecamatan tujuan tidak ditemukan')

  const provider = getShippingProvider()
  const rates = await provider.getRates({ destinationDistrictCode: districtCode, weightKg: priced.weightKg })
  return { ...priced, address, rates, provider: provider.id }
}

/**
 * Buat pesanan:
 * 1. Harga & ongkir dihitung ulang di server.
 * 2. Stok dipesan (dikurangi) dalam satu transaksi bersama pembuatan pesanan,
 *    sehingga dua pembeli tidak bisa membeli stok yang sama.
 * 3. Transaksi pembayaran dibuat; jika gagal, pesanan dibatalkan & stok kembali.
 */
export async function createOrder(input: CheckoutInput): Promise<Order> {
  const quote = await quoteCart(input.items, input.address.districtCode)
  const rate = findRate(quote.rates, input.shipping.courier, input.shipping.service)
  if (!rate) throw new OrderError('Layanan pengiriman tidak tersedia untuk alamat ini')

  const now = new Date()
  const mode = paymentMode()
  const order: Order = {
    orderNumber: await nextOrderNumber(now),
    status: 'BELUM_BAYAR',
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(now.getTime() + PAYMENT_WINDOW_HOURS * 3600_000),
    customer: input.customer,
    address: { ...quote.address, street: input.address.street, postalCode: input.address.postalCode },
    items: quote.lines,
    subtotal: quote.subtotal,
    weightKg: quote.weightKg,
    shipping: { ...rate, provider: quote.provider },
    total: quote.subtotal + rate.cost,
    payment: { provider: mode },
    stockReleased: false,
    history: [{ status: 'BELUM_BAYAR', at: now, by: 'pembeli', note: 'Pesanan dibuat' }],
  }

  const { varieties, stockMovements, orders } = await getStore()

  await withTransaction(async (session) => {
    for (const [varietyId, kg] of quote.stockNeeds) {
      const updated = await varieties.findOneAndUpdate(
        { _id: varietyId, stockKg: { $gte: kg } },
        { $inc: { stockKg: -kg }, $set: { updatedAt: now } },
        { session, returnDocument: 'after' }
      )
      if (!updated) {
        const variety = await varieties.findOne({ _id: varietyId }, { session })
        throw new OrderError(
          `Stok ${variety?.name ?? varietyId} tidak cukup (tersisa ${variety?.stockKg ?? 0} kg)`,
          409
        )
      }
      await stockMovements.insertOne(
        {
          varietyId,
          deltaKg: -kg,
          reason: 'PESANAN',
          orderNumber: order.orderNumber,
          by: 'sistem',
          at: now,
          balanceAfterKg: updated.stockKg,
        },
        { session }
      )
    }
    await orders.insertOne(order, { session })
  })

  if (mode === 'midtrans') {
    try {
      const transaction = await createSnapTransaction(order)
      order.payment.token = transaction.token
      order.payment.redirectUrl = transaction.redirect_url
      await orders.updateOne(
        { orderNumber: order.orderNumber },
        { $set: { 'payment.token': transaction.token, 'payment.redirectUrl': transaction.redirect_url } }
      )
    } catch (error) {
      console.error('Gagal membuat transaksi Midtrans:', error)
      await cancelOrder(order.orderNumber, { by: 'sistem', note: 'Gagal membuat transaksi pembayaran' })
      throw new OrderError('Gagal menghubungi layanan pembayaran. Silakan coba lagi.', 502)
    }
  }

  return order
}

/**
 * Batalkan pesanan dan kembalikan stok — idempoten:
 * stok hanya dikembalikan sekali (flag stockReleased).
 */
export async function cancelOrder(
  orderNumber: string,
  options: { by: OrderHistoryEntry['by']; note: string; from?: OrderStatus[] }
): Promise<Order | null> {
  const from = options.from ?? adminTransition('cancel').from
  const { orders, varieties, stockMovements } = await getStore()

  return withTransaction(async (session) => {
    const now = new Date()
    const order = await orders.findOneAndUpdate(
      { orderNumber, status: { $in: from } },
      {
        $set: { status: 'DIBATALKAN', updatedAt: now, stockReleased: true },
        $push: { history: { status: 'DIBATALKAN', at: now, by: options.by, note: options.note } },
      },
      { session, returnDocument: 'before' }
    )
    if (!order) return null

    if (!order.stockReleased) {
      const perVariety = new Map<string, number>()
      for (const line of order.items) {
        perVariety.set(line.varietyId, (perVariety.get(line.varietyId) ?? 0) + line.weightKg)
      }
      for (const [varietyId, kg] of perVariety) {
        const updated = await varieties.findOneAndUpdate(
          { _id: varietyId },
          { $inc: { stockKg: kg }, $set: { updatedAt: now } },
          { session, returnDocument: 'after' }
        )
        await stockMovements.insertOne(
          {
            varietyId,
            deltaKg: kg,
            reason: 'BATAL',
            orderNumber,
            note: options.note,
            by: options.by === 'admin' ? 'admin' : 'sistem',
            at: now,
            balanceAfterKg: updated?.stockKg,
          },
          { session }
        )
      }
    }
    return { ...order, status: 'DIBATALKAN' as const, stockReleased: true }
  })
}

type PaymentDetails = { status?: string; type?: string; transactionId?: string }

/** Terapkan hasil pembayaran (dari webhook, pengecekan status, atau simulasi) */
export async function applyPaymentOutcome(
  orderNumber: string,
  outcome: PaymentOutcome,
  details: PaymentDetails,
  by: OrderHistoryEntry['by']
) {
  const { orders } = await getStore()
  const now = new Date()

  if (outcome === 'paid') {
    const result = await orders.updateOne(
      { orderNumber, status: 'BELUM_BAYAR' },
      {
        $set: {
          status: 'DIKEMAS',
          updatedAt: now,
          'payment.status': details.status,
          'payment.type': details.type,
          'payment.transactionId': details.transactionId,
          'payment.paidAt': now,
        },
        $push: { history: { status: 'DIKEMAS', at: now, by, note: 'Pembayaran diterima' } },
      }
    )
    if (result.matchedCount === 0) {
      // Pembayaran masuk untuk pesanan yang sudah dibatalkan: tandai perlu refund
      await orders.updateOne(
        { orderNumber, status: 'DIBATALKAN', 'payment.paidAt': { $exists: false } },
        {
          $set: { 'payment.status': details.status, 'payment.paidAt': now, 'payment.needsRefund': true },
          $push: {
            history: {
              status: 'DIBATALKAN',
              at: now,
              by,
              note: 'Pembayaran diterima setelah pesanan dibatalkan — perlu refund manual',
            },
          },
        }
      )
    }
    return
  }

  if (outcome === 'failed') {
    await cancelOrder(orderNumber, {
      by,
      note: `Pembayaran ${details.status ?? 'gagal'}`,
      from: ['BELUM_BAYAR'],
    })
    return
  }

  await orders.updateOne({ orderNumber }, { $set: { 'payment.status': details.status, updatedAt: now } })
}

/** Batalkan pesanan yang melewati batas waktu bayar */
export async function expireStaleOrders(now = new Date()) {
  const { orders } = await getStore()
  const stale = await orders
    .find({ status: 'BELUM_BAYAR', expiresAt: { $lt: now } }, { projection: { orderNumber: 1 } })
    .toArray()
  for (const o of stale) {
    await cancelOrder(o.orderNumber, {
      by: 'sistem',
      note: 'Batas waktu pembayaran habis',
      from: ['BELUM_BAYAR'],
    })
  }
  return stale.length
}

/** Tanyakan status ke Midtrans untuk pesanan yang masih menunggu (cadangan bila webhook terlambat) */
async function refreshFromMidtrans(order: Order) {
  if (order.status !== 'BELUM_BAYAR' || order.payment.provider !== 'midtrans') return
  try {
    const status = await fetchTransactionStatus(order.orderNumber)
    const outcome = interpretMidtransStatus(status.transaction_status, status.fraud_status)
    if (outcome !== 'pending' && Number(status.gross_amount) === order.total) {
      await applyPaymentOutcome(
        order.orderNumber,
        outcome,
        {
          status: status.transaction_status,
          type: status.payment_type,
          transactionId: status.transaction_id as string | undefined,
        },
        'midtrans'
      )
    }
  } catch {
    // 404 = pembeli belum memilih metode bayar; abaikan
  }
}

/** Lacak pesanan oleh pembeli (guest): wajib cocok nomor pesanan + email */
export async function lookupOrder(orderNumber: string, email: string): Promise<Order | null> {
  const { orders } = await getStore()
  const order = await orders.findOne({ orderNumber, 'customer.email': email })
  if (!order) return null

  if (order.status === 'BELUM_BAYAR') {
    if (order.expiresAt < new Date()) {
      await cancelOrder(orderNumber, { by: 'sistem', note: 'Batas waktu pembayaran habis', from: ['BELUM_BAYAR'] })
    } else {
      await refreshFromMidtrans(order)
    }
    return orders.findOne({ orderNumber })
  }
  return order
}

export async function shipOrder(orderNumber: string, awb: string) {
  const { orders } = await getStore()
  const now = new Date()
  const { from, to } = adminTransition('ship')
  const result = await orders.updateOne(
    { orderNumber, status: { $in: from } },
    {
      $set: { status: to, updatedAt: now, tracking: { awb, shippedAt: now } },
      $push: { history: { status: to, at: now, by: 'admin', note: `Resi ${awb}` } },
    }
  )
  return result.matchedCount === 1
}

export async function completeOrder(orderNumber: string) {
  const { orders } = await getStore()
  const now = new Date()
  const { from, to } = adminTransition('complete')
  const result = await orders.updateOne(
    { orderNumber, status: { $in: from } },
    {
      $set: { status: to, updatedAt: now },
      $push: { history: { status: to, at: now, by: 'admin', note: 'Pesanan diterima pembeli' } },
    }
  )
  return result.matchedCount === 1
}

/** Mutasi stok manual oleh admin (restock / penyesuaian), tidak boleh membuat stok minus */
export async function adjustStock(input: {
  varietyId: string
  deltaKg: number
  reason: 'RESTOCK' | 'PENYESUAIAN'
  note?: string
}) {
  const { varieties, stockMovements } = await getStore()
  return withTransaction(async (session) => {
    const now = new Date()
    const filter =
      input.deltaKg < 0
        ? { _id: input.varietyId, stockKg: { $gte: -input.deltaKg } }
        : { _id: input.varietyId }
    const updated = await varieties.findOneAndUpdate(
      filter,
      { $inc: { stockKg: input.deltaKg }, $set: { updatedAt: now } },
      { session, returnDocument: 'after' }
    )
    if (!updated) throw new OrderError('Jenis beras tidak ditemukan atau stok tidak mencukupi', 409)
    await stockMovements.insertOne(
      { ...input, by: 'admin', at: now, balanceAfterKg: updated.stockKg },
      { session }
    )
    return updated
  })
}
