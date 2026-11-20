import { NextRequest, NextResponse } from 'next/server'
import { lookupOrder } from '@/lib/orders/service'
import { toPublicOrder } from '@/lib/orders/view'
import { errorResponse, readJson } from '@/lib/http'
import { lookupSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, email } = lookupSchema.parse(await readJson(request))
    const order = await lookupOrder(orderNumber, email)
    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan. Periksa nomor pesanan dan email.' },
        { status: 404 }
      )
    }
    return NextResponse.json({ order: toPublicOrder(order) })
  } catch (error) {
    return errorResponse(error, 'orders/lookup')
  }
}
