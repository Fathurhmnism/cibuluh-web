import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@/lib/store'
import { errorResponse, readJson } from '@/lib/http'
import { productUpdateSchema } from '@/lib/validation'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const input = productUpdateSchema.parse(await readJson(request))
    const { products } = await getStore()
    const product = await products.findOne({ _id: id })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

    // Harga per kemasan hanya untuk produk kemasan; harga per kg hanya untuk curah
    const { price, pricePerKg, ...rest } = input
    const update: Record<string, unknown> = { ...rest }
    if (price !== undefined && product.kind === 'pack') update.price = price
    if (pricePerKg !== undefined && product.kind === 'bulk') update.pricePerKg = pricePerKg

    await products.updateOne({ _id: id }, { $set: update })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return errorResponse(error, 'admin/products')
  }
}
