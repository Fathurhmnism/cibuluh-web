import { NextRequest, NextResponse } from 'next/server'
import { snap } from '@/lib/midtrans'

// ✅ Buat tipe data untuk item
type Item = {
  id: string
  name: string
  price: number
  quantity: number
}

export async function POST(req: NextRequest) {
  const { orderId, items, total }: {
    orderId: string
    items: Item[]
    total: number
  } = await req.json()

  if (!orderId || !items || !total) {
    return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
  }

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: total,
    },
    item_details: items.map((item: Item) => ({
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
  } catch (error: unknown) {
    console.error('❌ Gagal membuat transaksi Midtrans:', error)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Gagal membuat transaksi', debug: errMsg }, { status: 500 })
  }
}