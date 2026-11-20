import Link from 'next/link'
import RevenueChart from '../_components/RevenueChart'
import StatusBadge from '../_components/StatusBadge'
import { salesSummary } from '@/lib/admin/queries'
import { formatKg, formatRupiah } from '@/lib/format'
import { ORDER_STATUSES } from '@/lib/orders/status'

export const dynamic = 'force-dynamic'

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export default async function AdminSummaryPage() {
  const s = await salesSummary(30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ringkasan Penjualan</h1>
        <p className="text-sm text-gray-500">30 hari terakhir · dihitung dari pesanan yang sudah dibayar (tanpa ongkir)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Omzet" value={formatRupiah(s.revenue)} />
        <Tile label="Pesanan dibayar" value={String(s.orders)} />
        <Tile label="Rata-rata per pesanan" value={formatRupiah(s.averageOrder)} />
        <Tile label="Beras terjual" value={formatKg(s.kg)} />
      </div>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Omzet harian</h2>
        <RevenueChart data={s.series} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Pesanan per status (semua waktu)</h2>
          <ul className="space-y-2">
            {ORDER_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between">
                <Link href={`/admin/pesanan?status=${status}`} className="hover:underline">
                  <StatusBadge status={status} />
                </Link>
                <span className="tabular-nums">{s.statusCounts[status]}</span>
              </li>
            ))}
          </ul>
          {s.statusCounts.DIKEMAS > 0 && (
            <p className="mt-4 rounded bg-sky-50 p-2 text-sm text-sky-900">
              {s.statusCounts.DIKEMAS} pesanan menunggu dikirim.{' '}
              <Link href="/admin/pesanan?status=DIKEMAS" className="font-medium underline">
                Proses sekarang
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Produk terlaris</h2>
          {s.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada penjualan.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2 font-normal">Produk</th>
                  <th className="pb-2 text-right font-normal">Terjual</th>
                  <th className="pb-2 text-right font-normal">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {s.topProducts.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2 text-right tabular-nums">{formatKg(p.kg)}</td>
                    <td className="py-2 text-right tabular-nums">{formatRupiah(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
