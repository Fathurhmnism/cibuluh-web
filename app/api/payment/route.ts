import { NextRequest, NextResponse } from 'next/server'
const midtransClient = require('midtrans-client')

export async function POST(req: NextRequest) {
  const { orderId, items, total } = await req.json()

  if (!orderId || !items || !total) {
    return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
  }

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  })

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: total,
    },
    item_details: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    credit_card: {
      secure: true,
    },
  }

  try {
    const transaction = await snap.createTransaction(parameter)
    return NextResponse.json({ token: transaction.token })
  } catch (error: any) {
    console.error('❌ Gagal membuat transaksi Midtrans:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi', debug: error?.message || error }, { status: 500 })
  }
}