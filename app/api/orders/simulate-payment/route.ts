import { NextRequest, NextResponse } from 'next/server'
import { applyPaymentOutcome, lookupOrder } from '@/lib/orders/service'
import { paymentMode } from '@/lib/payment'
import { errorResponse, readJson } from '@/lib/http'
import { lookupSchema } from '@/lib/validation'

// Hanya aktif saat mode pembayaran "simulasi" (tanpa Midtrans).
export async function POST(request: NextRequest) {
  if (paymentMode() !== 'simulasi') {
    return NextResponse.json({ error: 'Pembayaran simulasi tidak aktif' }, { status: 404 })
  }
  try {
    const { orderNumber, email } = lookupSchema.parse(await readJson(request))
    const order = await lookupOrder(orderNumber, email)
    if (!order || order.payment.provider !== 'simulasi') {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }
    if (order.status !== 'BELUM_BAYAR') {
      return NextResponse.json({ error: 'Pesanan ini tidak menunggu pembayaran' }, { status: 409 })
    }
    await applyPaymentOutcome(orderNumber, 'paid', { status: 'settlement', type: 'simulasi' }, 'pembeli')
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'orders/simulate-payment')
  }
}
