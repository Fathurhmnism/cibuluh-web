import type { Filter } from 'mongodb'
import { getStore } from '../store'
import { expireStaleOrders } from '../orders/service'
import { ORDER_STATUSES, PAID_STATUSES, type OrderStatus } from '../orders/status'
import type { Order } from '../orders/types'

export type OrderFilter = {
  status?: string
  q?: string
  from?: string // YYYY-MM-DD (WIB)
  to?: string // YYYY-MM-DD (WIB), inklusif
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Awal hari (WIB) dalam UTC */
function jakartaDayStart(date: string) {
  return new Date(`${date}T00:00:00+07:00`)
}

export function buildOrderQuery(filter: OrderFilter): Filter<Order> {
  const query: Filter<Order> = {}
  if (filter.status && (ORDER_STATUSES as readonly string[]).includes(filter.status)) {
    query.status = filter.status as OrderStatus
  }
  if (filter.q?.trim()) {
    const rx = new RegExp(escapeRegex(filter.q.trim()), 'i')
    query.$or = [{ orderNumber: rx }, { 'customer.name': rx }, { 'customer.email': rx }, { 'customer.phone': rx }]
  }
  const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v))
  if (isDate(filter.from) || isDate(filter.to)) {
    query.createdAt = {}
    if (isDate(filter.from)) query.createdAt.$gte = jakartaDayStart(filter.from!)
    if (isDate(filter.to)) {
      query.createdAt.$lt = new Date(jakartaDayStart(filter.to!).getTime() + 24 * 3600_000)
    }
  }
  return query
}

export async function listOrders(filter: OrderFilter, options: { page?: number; pageSize?: number } = {}) {
  await expireStaleOrders()
  const { orders } = await getStore()
  const pageSize = options.pageSize ?? 20
  const page = Math.max(1, options.page ?? 1)
  const query = buildOrderQuery(filter)
  const [items, total, counts] = await Promise.all([
    orders
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
    orders.countDocuments(query),
    orders.aggregate<{ _id: OrderStatus; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray(),
  ])
  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>
  for (const c of counts) statusCounts[c._id] = c.n
  return { items, total, page, pageSize, statusCounts }
}

export async function exportOrders(filter: OrderFilter) {
  const { orders } = await getStore()
  return orders.find(buildOrderQuery(filter)).sort({ createdAt: -1 }).limit(5000).toArray()
}

export async function getOrder(orderNumber: string) {
  const { orders } = await getStore()
  return orders.findOne({ orderNumber })
}

/** Ringkasan penjualan N hari terakhir (WIB). Penjualan = pesanan yang sudah dibayar. */
export async function salesSummary(days = 30) {
  await expireStaleOrders()
  const { orders } = await getStore()

  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const start = new Date(jakartaDayStart(todayKey).getTime() - (days - 1) * 24 * 3600_000)
  const paidMatch = { status: { $in: PAID_STATUSES }, 'payment.paidAt': { $gte: start } }

  const [totals, daily, topProducts, statusAgg] = await Promise.all([
    orders
      .aggregate<{ revenue: number; orders: number; kg: number }>([
        { $match: paidMatch },
        { $group: { _id: null, revenue: { $sum: '$subtotal' }, orders: { $sum: 1 }, kg: { $sum: '$weightKg' } } },
      ])
      .toArray(),
    orders
      .aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: paidMatch },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$payment.paidAt', timezone: 'Asia/Jakarta' } },
            revenue: { $sum: '$subtotal' },
            orders: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    orders
      .aggregate<{ _id: string; name: string; kg: number; revenue: number }>([
        { $match: paidMatch },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            kg: { $sum: '$items.weightKg' },
            revenue: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
    orders.aggregate<{ _id: OrderStatus; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray(),
  ])

  // Isi hari yang kosong dengan 0 agar grafik kontinu
  const byDay = new Map(daily.map((d) => [d._id, d]))
  const series = Array.from({ length: days }, (_, i) => {
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(
      new Date(start.getTime() + i * 24 * 3600_000 + 12 * 3600_000)
    )
    return { date: key, revenue: byDay.get(key)?.revenue ?? 0, orders: byDay.get(key)?.orders ?? 0 }
  })

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>
  for (const s of statusAgg) statusCounts[s._id] = s.n

  const t = totals[0] ?? { revenue: 0, orders: 0, kg: 0 }
  return {
    days,
    revenue: t.revenue,
    orders: t.orders,
    kg: t.kg,
    averageOrder: t.orders ? Math.round(t.revenue / t.orders) : 0,
    series,
    topProducts,
    statusCounts,
  }
}

export async function inventoryOverview() {
  const { products, varieties, stockMovements } = await getStore()
  const [productList, varietyList, movements] = await Promise.all([
    products.find().sort({ sort: 1 }).toArray(),
    varieties.find().sort({ _id: 1 }).toArray(),
    stockMovements.find().sort({ at: -1 }).limit(30).toArray(),
  ])
  return { products: productList, varieties: varietyList, movements }
}
