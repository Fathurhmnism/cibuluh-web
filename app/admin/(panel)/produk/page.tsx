import ProductRow from '../../_components/ProductRow'
import StockForm from '../../_components/StockForm'
import { inventoryOverview } from '@/lib/admin/queries'
import { formatDateTime, formatKg } from '@/lib/format'

export const dynamic = 'force-dynamic'

const REASON_LABEL = { RESTOCK: 'Restock', PENYESUAIAN: 'Penyesuaian', PESANAN: 'Pesanan', BATAL: 'Batal' } as const

export default async function AdminProductsPage() {
  const { products, varieties, movements } = await inventoryOverview()
  const varietyName = new Map(varieties.map((v) => [v._id, v.name]))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Produk & Stok</h1>

      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-semibold">Stok per jenis beras</h2>
        <p className="mb-4 text-sm text-gray-500">
          Stok dicatat dalam kg. Kemasan dan curah dari jenis yang sama mengambil stok yang sama.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {varieties.map((v) => (
            <div key={v._id} className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">{v.name}</p>
              <p className={`text-2xl font-semibold tabular-nums ${v.stockKg < 50 ? 'text-red-700' : ''}`}>
                {formatKg(v.stockKg)}
              </p>
              {v.stockKg < 50 && <p className="text-xs font-medium text-red-700">⚠ Stok menipis</p>}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <StockForm varieties={varieties.map((v) => ({ id: v._id, name: v.name }))} />
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <h2 className="px-5 pt-5 font-semibold">Produk</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="bg-stone-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Produk</th>
              <th className="px-4 py-2 font-medium">Jenis</th>
              <th className="px-4 py-2 font-medium">Satuan</th>
              <th className="px-4 py-2 font-medium">Harga</th>
              <th className="px-4 py-2 font-medium">Aktif</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p._id}
                product={{
                  id: p._id,
                  name: p.name,
                  kind: p.kind,
                  variety: varietyName.get(p.varietyId) ?? p.varietyId,
                  unit: p.kind === 'pack' ? `Kemasan ${p.packWeightKg} kg` : `Curah ${p.minKg}–${p.maxKg} kg`,
                  price: p.kind === 'pack' ? p.price : p.pricePerKg,
                  active: p.active,
                }}
              />
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <h2 className="px-5 pt-5 font-semibold">Kartu stok (30 mutasi terakhir)</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="bg-stone-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Waktu</th>
              <th className="px-4 py-2 font-medium">Jenis beras</th>
              <th className="px-4 py-2 font-medium">Keterangan</th>
              <th className="px-4 py-2 text-right font-medium">Mutasi</th>
              <th className="px-4 py-2 text-right font-medium">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Belum ada mutasi.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={String(m._id)} className="border-t">
                  <td className="whitespace-nowrap px-4 py-2 text-gray-600">{formatDateTime(m.at)}</td>
                  <td className="px-4 py-2">{varietyName.get(m.varietyId) ?? m.varietyId}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {REASON_LABEL[m.reason]}
                    {m.orderNumber ? ` · ${m.orderNumber}` : ''}
                    {m.note && !m.orderNumber ? ` · ${m.note}` : ''}
                  </td>
                  <td className={`px-4 py-2 text-right tabular-nums ${m.deltaKg < 0 ? 'text-red-700' : 'text-green-800'}`}>
                    {m.deltaKg > 0 ? '+' : ''}
                    {formatKg(m.deltaKg)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {m.balanceAfterKg !== undefined ? formatKg(m.balanceAfterKg) : '–'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
