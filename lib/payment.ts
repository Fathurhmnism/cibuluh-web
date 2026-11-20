import { createHash, timingSafeEqual } from 'node:crypto'
import midtransClient from 'midtrans-client'
import type { Order } from './orders/types'
import { PAYMENT_WINDOW_HOURS } from './orders/status'

/**
 * Mode pembayaran:
 * - "midtrans": Snap Midtrans (sandbox). Butuh MIDTRANS_SERVER_KEY.
 * - "simulasi": tanpa gateway; pembeli menekan tombol "Bayar (simulasi)".
 *   Berguna untuk demo/lokal tanpa kredensial.
 * Default: midtrans bila server key tersedia, selain itu simulasi.
 */
export type PaymentMode = 'midtrans' | 'simulasi'

export function paymentMode(): PaymentMode {
  const explicit = process.env.PAYMENT_PROVIDER
  if (explicit === 'midtrans' || explicit === 'simulasi') return explicit
  return process.env.MIDTRANS_SERVER_KEY ? 'midtrans' : 'simulasi'
}

// Mode sandbox (demo). Ganti ke true hanya jika memakai akun production.
const IS_PRODUCTION = false

function snap() {
  return new midtransClient.Snap({
    isProduction: IS_PRODUCTION,
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  })
}

export function snapScriptUrl() {
  return IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js'
}

/** Buat transaksi Snap. Total item_details harus sama persis dengan gross_amount. */
export async function createSnapTransaction(order: Order) {
  const itemDetails = [
    ...order.items.map((l) => ({
      id: l.productId,
      name: `${l.name}${l.unit === 'kg' ? ' (per kg)' : ''}`.slice(0, 50),
      price: l.unitPrice,
      quantity: l.quantity,
    })),
    {
      id: 'ONGKIR',
      name: `Ongkir ${order.shipping.courierName} ${order.shipping.service}`.slice(0, 50),
      price: order.shipping.cost,
      quantity: 1,
    },
  ]

  return snap().createTransaction({
    transaction_details: { order_id: order.orderNumber, gross_amount: order.total },
    item_details: itemDetails,
    customer_details: {
      first_name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
    },
    expiry: { unit: 'hour', duration: PAYMENT_WINDOW_HOURS },
  })
}

export async function fetchTransactionStatus(orderNumber: string) {
  return snap().transaction.status(orderNumber)
}

/**
 * Verifikasi signature notifikasi Midtrans:
 * SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyMidtransSignature(
  body: { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string },
  serverKey: string
): boolean {
  if (!body.order_id || !body.status_code || !body.gross_amount || !body.signature_key || !serverKey) {
    return false
  }
  const expected = createHash('sha512')
    .update(body.order_id + body.status_code + body.gross_amount + serverKey)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(body.signature_key)
  return a.length === b.length && timingSafeEqual(a, b)
}

export type PaymentOutcome = 'paid' | 'failed' | 'pending'

/** Terjemahkan status transaksi Midtrans ke hasil yang dipahami sistem pesanan */
export function interpretMidtransStatus(transactionStatus: string, fraudStatus?: string): PaymentOutcome {
  if (transactionStatus === 'settlement') return 'paid'
  if (transactionStatus === 'capture') return fraudStatus === 'accept' || !fraudStatus ? 'paid' : 'pending'
  if (['deny', 'cancel', 'expire', 'failure'].includes(transactionStatus)) return 'failed'
  return 'pending'
}
