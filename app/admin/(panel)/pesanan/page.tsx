import Link from 'next/link'
import StatusBadge from '../../_components/StatusBadge'
import { listOrders } from '@/lib/admin/queries'
import { formatDateTime, formatRupiah } from '@/lib/format'
import { ORDER_STATUSES, STATUS_LABEL } from '@/lib/orders/status'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<Record<string, string | undefined>>

const fieldClass = 'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm'

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const filter = { status: sp.status, q: sp.q, from: sp.from, to: sp.to }
  const page = Number(sp.page) || 1
  const { items, total, pageSize, statusCounts } = await listOrders(filter, { page })
  const pages = Math.max(1, Math.ceil(total / pageSize))

  const query = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries({ ...filter, ...overrides })) if (v) params.set(k, v)
    return params.toString()
  }
  const exportQuery = query({ page: undefined })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pesanan</h1>
        <div className="flex gap-2 text-sm">
          <a href={`/api/admin/orders/export?format=xlsx&${exportQuery}`} className="rounded-lg border bg-white px-3 py-1.5 hover:bg-gray-50">
            Export Excel
          </a>
          <a href={`/api/admin/orders/export?format=csv&${exportQuery}`} className="rounded-lg border bg-white px-3 py-1.5 hover:bg-gray-50">
            Export CSV
          </a>
        </div>
      </div>

      {/* Tab status */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/admin/pesanan?${query({ status: undefined, page: undefined })}`}
          className={`rounded-full px-3 py-1 ${!filter.status ? 'bg-green-800 text-white' : 'bg-white hover:bg-gray-50'}`}
        >
          Semua
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pesanan?${query({ status: s, page: undefined })}`}
            className={`rounded-full px-3 py-1 ${filter.status === s ? 'bg-green-800 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            {STATUS_LABEL[s]} <span className="opacity-70">({statusCounts[s]})</span>
          </Link>
        ))}
      </nav>

      {/* Filter */}
      <form className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3 shadow-sm" method="get">
        {filter.status && <input type="hidden" name="status" value={filter.status} />}
        <label className="text-xs text-gray-500">
          Cari
          <input name="q" defaultValue={filter.q} placeholder="No. pesanan, nama, email, HP" className={`mt-1 block w-64 ${fieldClass}`} />
        </label>
        <label className="text-xs text-gray-500">
          Dari
          <input type="date" name="from" defaultValue={filter.from} className={`mt-1 block ${fieldClass}`} />
        </label>
        <label className="text-xs text-gray-500">
          Sampai
          <input type="date" name="to" defaultValue={filter.to} className={`mt-1 block ${fieldClass}`} />
        </label>
        <button className="rounded-lg bg-green-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-900">Terapkan</button>
        {(filter.q || filter.from || filter.to) && (
          <Link href={`/admin/pesanan${filter.status ? `?status=${filter.status}` : ''}`} className="px-2 py-1.5 text-sm text-gray-500 hover:underline">
            Reset
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">No. Pesanan</th>
              <th className="px-4 py-2 font-medium">Tanggal</th>
              <th className="px-4 py-2 font-medium">Pembeli</th>
              <th className="px-4 py-2 font-medium">Tujuan</th>
              <th className="px-4 py-2 text-right font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Tidak ada pesanan yang cocok.
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o.orderNumber} className="border-t hover:bg-stone-50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/pesanan/${o.orderNumber}`} className="font-medium text-green-900 hover:underline">
                      {o.orderNumber}
                    </Link>
                    {o.payment.needsRefund && <span className="ml-2 text-xs font-medium text-red-700">Perlu refund</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-600">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-2">
                    {o.customer.name}
                    <span className="block text-xs text-gray-500">{o.customer.email}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{o.address.regencyName}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatRupiah(o.total)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Halaman {page} dari {pages} · {total} pesanan
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/admin/pesanan?${query({ page: String(page - 1) })}`} className="rounded border bg-white px-3 py-1">
                ← Sebelumnya
              </Link>
            )}
            {page < pages && (
              <Link href={`/admin/pesanan?${query({ page: String(page + 1) })}`} className="rounded border bg-white px-3 py-1">
                Berikutnya →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
