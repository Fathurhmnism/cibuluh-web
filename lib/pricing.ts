import { Product, unitPrice, weightFor } from './catalog'

export type CartInput = { productId: string; quantity: number }

export type OrderLine = {
  productId: string
  varietyId: string
  name: string
  kind: Product['kind']
  unit: 'pcs' | 'kg'
  unitPrice: number
  quantity: number
  weightKg: number
  lineTotal: number
}

export class PricingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PricingError'
  }
}

/**
 * Hitung baris pesanan dari input keranjang dengan harga dari database.
 * Harga dari browser TIDAK pernah dipakai — hanya productId dan kuantitas.
 */
export function priceCart(items: CartInput[], products: Product[]) {
  if (items.length === 0) throw new PricingError('Keranjang kosong')

  // Gabungkan item ganda untuk produk yang sama
  const merged = new Map<string, number>()
  for (const item of items) {
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity)
  }

  const byId = new Map(products.map((p) => [p._id, p]))
  const lines: OrderLine[] = []

  for (const [productId, quantity] of merged) {
    const product = byId.get(productId)
    if (!product || !product.active) {
      throw new PricingError(`Produk tidak tersedia: ${productId}`)
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new PricingError(`Kuantitas tidak valid untuk ${product.name}`)
    }
    if (product.kind === 'bulk' && (quantity < product.minKg || quantity > product.maxKg)) {
      throw new PricingError(
        `${product.name} hanya bisa dibeli ${product.minKg}–${product.maxKg} kg per pesanan`
      )
    }

    const price = unitPrice(product)
    lines.push({
      productId,
      varietyId: product.varietyId,
      name: product.name,
      kind: product.kind,
      unit: product.kind === 'pack' ? 'pcs' : 'kg',
      unitPrice: price,
      quantity,
      weightKg: weightFor(product, quantity),
      lineTotal: price * quantity,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const weightKg = lines.reduce((sum, l) => sum + l.weightKg, 0)

  // Kebutuhan stok per jenis beras
  const stockNeeds = new Map<string, number>()
  for (const l of lines) {
    stockNeeds.set(l.varietyId, (stockNeeds.get(l.varietyId) ?? 0) + l.weightKg)
  }

  return { lines, subtotal, weightKg, stockNeeds }
}
