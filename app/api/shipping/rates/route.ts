import { NextRequest, NextResponse } from 'next/server'
import { quoteCart } from '@/lib/orders/service'
import { errorResponse, readJson } from '@/lib/http'
import { ratesRequestSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const input = ratesRequestSchema.parse(await readJson(request))
    const quote = await quoteCart(input.items, input.districtCode)
    return NextResponse.json({
      provider: quote.provider,
      subtotal: quote.subtotal,
      weightKg: quote.weightKg,
      rates: quote.rates,
    })
  } catch (error) {
    return errorResponse(error, 'shipping/rates')
  }
}
