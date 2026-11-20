import { NextRequest, NextResponse } from 'next/server'
import { cancelOrder, completeOrder, shipOrder } from '@/lib/orders/service'
import { errorResponse, readJson } from '@/lib/http'
import { adminOrderActionSchema } from '@/lib/validation'

type Params = { params: Promise<{ orderNumber: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { orderNumber } = await params
  try {
    const input = adminOrderActionSchema.parse(await readJson(request))
    let ok = false
    if (input.action === 'ship') ok = await shipOrder(orderNumber, input.awb)
    if (input.action === 'complete') ok = await completeOrder(orderNumber)
    if (input.action === 'cancel') {
      ok = Boolean(await cancelOrder(orderNumber, { by: 'admin', note: input.note }))
    }
    if (!ok) {
      return NextResponse.json(
        { error: 'Aksi tidak bisa dilakukan pada status pesanan saat ini' },
        { status: 409 }
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'admin/orders/action')
  }
}
