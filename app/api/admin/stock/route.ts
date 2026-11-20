import { NextRequest, NextResponse } from 'next/server'
import { adjustStock } from '@/lib/orders/service'
import { errorResponse, readJson } from '@/lib/http'
import { stockMovementSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const input = stockMovementSchema.parse(await readJson(request))
    if (input.reason === 'RESTOCK' && input.deltaKg < 0) {
      return NextResponse.json({ error: 'Restock harus bernilai positif' }, { status: 400 })
    }
    const variety = await adjustStock(input)
    return NextResponse.json({ ok: true, stockKg: variety.stockKg })
  } catch (error) {
    return errorResponse(error, 'admin/stock')
  }
}
