import { NextRequest, NextResponse } from 'next/server'
import { expireStaleOrders } from '@/lib/orders/service'
import { errorResponse } from '@/lib/http'

// Dipanggil Vercel Cron (lihat vercel.json). Vercel mengirim header
// Authorization: Bearer <CRON_SECRET> bila env CRON_SECRET diatur.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const expired = await expireStaleOrders()
    return NextResponse.json({ expired })
  } catch (error) {
    return errorResponse(error, 'cron/expire-orders')
  }
}
