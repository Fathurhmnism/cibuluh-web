import type { StorefrontProduct } from './store'

/** Bentuk produk yang dikirim ke komponen klien (tanpa field internal) */
export type ShowcaseProduct = {
  id: string
  kind: 'pack' | 'bulk'
  name: string
  description: string
  image: string
  unitPrice: number
  kgPerUnit: number
  minQuantity: number
  maxQuantity: number
  stockKg: number
}

export function toShowcase(p: StorefrontProduct): ShowcaseProduct {
  if (p.kind === 'pack') {
    return {
      id: p._id,
      kind: 'pack',
      name: p.name,
      description: p.description,
      image: p.image,
      unitPrice: p.price,
      kgPerUnit: p.packWeightKg,
      minQuantity: 1,
      maxQuantity: Math.max(0, Math.floor(p.stockKg / p.packWeightKg)),
      stockKg: p.stockKg,
    }
  }
  return {
    id: p._id,
    kind: 'bulk',
    name: p.name,
    description: p.description,
    image: p.image,
    unitPrice: p.pricePerKg,
    kgPerUnit: 1,
    minQuantity: p.minKg,
    maxQuantity: Math.max(0, Math.min(p.maxKg, Math.floor(p.stockKg))),
    stockKg: p.stockKg,
  }
}
