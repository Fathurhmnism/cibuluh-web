import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
const midtransClient = require('midtrans-client')

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID tidak ditemukan' }, { status: 400 })
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY tidak tersedia' }, { status: 500 })
  }

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey,
  })

  try {
    const status = await snap.transaction.status(orderId)

    if (!status || !status.transaction_status) {
      return NextResponse.json({ error: 'Status transaksi tidak valid' }, { status: 500 })
    }

    const finalStatus = status.transaction_status

    // ✅ Simpan ke DB hanya jika transaksi sukses
    if (finalStatus === 'settlement' || finalStatus === 'capture') {
      const db = await connectToDatabase()
      await db.collection('orders').updateOne(
        { orderId },
        {
          $set: {
            status: finalStatus,
            payment_type: status.payment_type || '',
            fraud_status: status.fraud_status || '',
            transaction_time: status.transaction_time || '',
            settlement_time: status.settlement_time || null,
            va_numbers: status.va_numbers || [],
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    }

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('❌ Gagal ambil status:', error?.ApiResponse || error)
    return NextResponse.json(
      {
        error: 'Gagal ambil status',
        debug: error?.ApiResponse || error?.message || error,
      },
      { status: 500 }
    )
  }
}