import type { Db } from 'mongodb'
import { connectToDatabase } from './mongodb'
import { Product, SEED_PRODUCTS, SEED_VARIETIES, Variety } from './catalog'
import type { Order, StockMovement } from './orders/types'

export function collections(db: Db) {
  return {
    products: db.collection<Product>('products'),
    varieties: db.collection<Variety>('varieties'),
    orders: db.collection<Order>('orders'),
    stockMovements: db.collection<StockMovement>('stock_movements'),
    counters: db.collection<{ _id: string; seq: number }>('counters'),
  }
}

const globalForStore = globalThis as unknown as { _storeReady?: Promise<void> }

/**
 * Pastikan index ada dan katalog awal terisi (sekali per proses).
 * Seed memakai $setOnInsert sehingga tidak menimpa data yang diubah admin.
 */
async function prepare(db: Db) {
  const c = collections(db)
  await Promise.all([
    c.orders.createIndex({ orderNumber: 1 }, { unique: true }),
    c.orders.createIndex({ status: 1, createdAt: -1 }),
    c.orders.createIndex({ status: 1, expiresAt: 1 }),
    c.orders.createIndex({ 'customer.email': 1 }),
    c.stockMovements.createIndex({ varietyId: 1, at: -1 }),
  ])

  if ((await c.products.estimatedDocumentCount()) === 0) {
    await c.varieties.bulkWrite(
      SEED_VARIETIES.map((v) => ({
        updateOne: {
          filter: { _id: v._id },
          update: { $setOnInsert: { ...v, updatedAt: new Date() } },
          upsert: true,
        },
      }))
    )
    await c.products.bulkWrite(
      SEED_PRODUCTS.map((p) => ({
        updateOne: { filter: { _id: p._id }, update: { $setOnInsert: p }, upsert: true },
      }))
    )
  }
}

export async function getStore() {
  const db = await connectToDatabase()
  if (!globalForStore._storeReady) {
    globalForStore._storeReady = prepare(db).catch((error) => {
      globalForStore._storeReady = undefined
      throw error
    })
  }
  await globalForStore._storeReady
  return { db, ...collections(db) }
}

export type StorefrontProduct = Product & { stockKg: number }

/** Produk aktif beserta sisa stok jenis berasnya, untuk etalase */
export async function listStorefrontProducts(): Promise<StorefrontProduct[]> {
  const { products, varieties } = await getStore()
  const [items, stock] = await Promise.all([
    products.find({ active: true }).sort({ sort: 1 }).toArray(),
    varieties.find().toArray(),
  ])
  const stockById = new Map(stock.map((v) => [v._id, v.stockKg]))
  return items.map((p) => ({ ...p, stockKg: stockById.get(p.varietyId) ?? 0 }))
}
