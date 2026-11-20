/**
 * Model katalog.
 *
 * - Variety (jenis beras) memegang STOK dalam kg.
 * - Product adalah cara menjual sebuah variety:
 *     - kind "pack": kemasan tetap (mis. 5 kg), kuantitas = jumlah kemasan
 *     - kind "bulk": curah per kg, kuantitas = jumlah kg
 *   Kemasan dan curah dari variety yang sama mengambil stok yang sama.
 */

export type Variety = {
  _id: string
  name: string
  stockKg: number
  updatedAt?: Date
}

export type PackProduct = {
  _id: string
  kind: 'pack'
  varietyId: string
  name: string
  description: string
  image: string
  packWeightKg: number
  price: number
  active: boolean
  sort: number
}

export type BulkProduct = {
  _id: string
  kind: 'bulk'
  varietyId: string
  name: string
  description: string
  image: string
  pricePerKg: number
  minKg: number
  maxKg: number
  active: boolean
  sort: number
}

export type Product = PackProduct | BulkProduct

/** Harga per satuan (per kemasan atau per kg) */
export function unitPrice(product: Product): number {
  return product.kind === 'pack' ? product.price : product.pricePerKg
}

/** Berat (kg) untuk sejumlah kuantitas produk */
export function weightFor(product: Product, quantity: number): number {
  return product.kind === 'pack' ? product.packWeightKg * quantity : quantity
}

export const SEED_VARIETIES: Variety[] = [
  { _id: 'premium', name: 'Beras Premium', stockKg: 500 },
  { _id: 'organik', name: 'Beras Organik', stockKg: 200 },
  { _id: 'pandan-wangi', name: 'Beras Super Pandan Wangi', stockKg: 300 },
]

const IMG = '/5kg.PNG'

export const SEED_PRODUCTS: Product[] = [
  {
    _id: 'premium-5kg',
    kind: 'pack',
    varietyId: 'premium',
    name: 'Beras Premium 5 kg',
    description: 'Putih bersih, pulen, dan tahan lama — ideal untuk konsumsi harian keluarga.',
    image: IMG,
    packWeightKg: 5,
    price: 88000,
    active: true,
    sort: 1,
  },
  {
    _id: 'premium-10kg',
    kind: 'pack',
    varietyId: 'premium',
    name: 'Beras Premium 10 kg',
    description: 'Kemasan hemat untuk kebutuhan keluarga besar atau usaha kuliner.',
    image: IMG,
    packWeightKg: 10,
    price: 170000,
    active: true,
    sort: 2,
  },
  {
    _id: 'organik-10kg',
    kind: 'pack',
    varietyId: 'organik',
    name: 'Beras Organik 10 kg',
    description: 'Ditanam tanpa pestisida kimia, ramah lingkungan dan sehat untuk tubuh.',
    image: IMG,
    packWeightKg: 10,
    price: 145000,
    active: true,
    sort: 3,
  },
  {
    _id: 'pandan-wangi-5kg',
    kind: 'pack',
    varietyId: 'pandan-wangi',
    name: 'Beras Super Pandan Wangi 5 kg',
    description: 'Aroma khas pandan dengan tekstur sangat pulen dan lezat.',
    image: IMG,
    packWeightKg: 5,
    price: 88000,
    active: true,
    sort: 4,
  },
  {
    _id: 'premium-curah',
    kind: 'bulk',
    varietyId: 'premium',
    name: 'Beras Premium Curah',
    description: 'Beli sesuai kebutuhan, per kilogram.',
    image: IMG,
    pricePerKg: 17000,
    minKg: 1,
    maxKg: 100,
    active: true,
    sort: 10,
  },
  {
    _id: 'pandan-wangi-curah',
    kind: 'bulk',
    varietyId: 'pandan-wangi',
    name: 'Beras Pandan Wangi Curah',
    description: 'Beli sesuai kebutuhan, per kilogram.',
    image: IMG,
    pricePerKg: 17500,
    minKg: 1,
    maxKg: 100,
    active: true,
    sort: 11,
  },
]
