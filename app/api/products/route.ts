import { NextResponse } from 'next/server'
import { listStorefrontProducts } from '@/lib/store'
import { errorResponse } from '@/lib/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ products: await listStorefrontProducts() })
  } catch (error) {
    return errorResponse(error, 'products')
  }
}
