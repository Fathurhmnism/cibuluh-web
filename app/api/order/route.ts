import { connectToDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const db = await connectToDatabase()
    const result = await db.collection('orders').insertOne({
      ...body, // items, total, paymentMethod, etc
    })

    console.log('✅ Order disimpan:', result.insertedId)

    return NextResponse.json({ message: 'Order berhasil disimpan' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error simpan order:', error)
    return NextResponse.json({ error: 'Gagal simpan order' }, { status: 500 })
  }
}