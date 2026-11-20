import { NextRequest, NextResponse } from 'next/server'
import { applyPaymentOutcome } from '@/lib/orders/service'
import { interpretMidtransStatus, verifyMidtransSignature } from '@/lib/payment'
import { getStore } from '@/lib/store'
import { readJson } from '@/lib/http'

type Notification = {
  order_id?: string
  status_code?: string
  gross_amount?: string
  signature_key?: string
  transaction_status?: string
  fraud_status?: string
  payment_type?: string
  transaction_id?: string
}

/**
 * Webhook Midtrans (Payment Notification URL).
 * Atur di Dashboard Midtrans → Settings → Payment → Notification URL:
 *   https://<domain>/api/midtrans/notification
 */
export async function POST(request: NextRequest) {
  const body = (await readJson(request)) as Notification | null
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''

  if (!body || !verifyMidtransSignature(body, serverKey)) {
    return NextResponse.json({ error: 'Signature tidak valid' }, { status: 401 })
  }

  try {
    const { orders } = await getStore()
    const order = await orders.findOne({ orderNumber: body.order_id })
    if (!order) {
      // Balas 200 agar Midtrans tidak terus mengulang untuk order yang bukan milik sistem ini
      return NextResponse.json({ ok: true, ignored: 'order tidak dikenal' })
    }
    if (Number(body.gross_amount) !== order.total) {
      console.error('[midtrans] gross_amount tidak cocok', body.order_id, body.gross_amount, order.total)
      return NextResponse.json({ error: 'Nominal tidak cocok' }, { status: 400 })
    }

    const outcome = interpretMidtransStatus(body.transaction_status ?? '', body.fraud_status)
    await applyPaymentOutcome(
      order.orderNumber,
      outcome,
      { status: body.transaction_status, type: body.payment_type, transactionId: body.transaction_id },
      'midtrans'
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[midtrans/notification]', error)
    // 500 → Midtrans akan mencoba mengirim ulang
    return NextResponse.json({ error: 'Gagal memproses notifikasi' }, { status: 500 })
  }
}
