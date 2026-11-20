import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orders/service'
import { errorResponse, readJson } from '@/lib/http'
import { checkoutSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const input = checkoutSchema.parse(await readJson(request))
    const order = await createOrder(input)
    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
        email: order.customer.email,
        total: order.total,
        paymentProvider: order.payment.provider,
        token: order.payment.token ?? null,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorResponse(error, 'checkout')
  }
}
