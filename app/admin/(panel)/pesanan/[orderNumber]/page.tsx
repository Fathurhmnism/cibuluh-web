import Link from 'next/link'
import { notFound } from 'next/navigation'
import StatusBadge from '../../../_components/StatusBadge'
import OrderActions from '../../../_components/OrderActions'
import { getOrder } from '@/lib/admin/queries'
import { formatDateTime, formatKg, formatRupiah } from '@/lib/format'
import { STATUS_LABEL, allowedAdminActions } from '@/lib/orders/status'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = await getOrder(orderNumber)
  if (!order) notFound()

  return (
    <div className="space-y-4">
      <Link href="/admin/pesanan" className="text-sm text-gray-500 hover:underline">
        ← Semua pesanan
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        {order.payment.needsRefund && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Pembayaran masuk setelah batal — perlu refund manual
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Produk</h2>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.productId} className="border-b last:border-0">
                    <td className="py-2">{i.name}</td>
                    <td className="py-2 text-right tabular-nums text-gray-600">
                      {i.quantity}
                      {i.unit === 'kg' ? ' kg' : ' pcs'} × {formatRupiah(i.unitPrice)}
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatRupiah(i.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-3 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal · {formatKg(order.weightKg)}</dt>
                <dd className="tabular-nums">{formatRupiah(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">
                  Ongkir {order.shipping.courierName} {order.shipping.service} · {order.shipping.billableWeightKg} kg ({order.shipping.provider})
                </dt>
                <dd className="tabular-nums">{formatRupiah(order.shipping.cost)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatRupiah(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-5 text-sm shadow-sm">
              <h2 className="mb-2 font-semibold">Pembeli</h2>
              <p>{order.customer.name}</p>
              <p className="text-gray-600">{order.customer.email}</p>
              <p className="text-gray-600">{order.customer.phone}</p>
            </div>
            <div className="rounded-xl bg-white p-5 text-sm shadow-sm">
              <h2 className="mb-2 font-semibold">Alamat kirim</h2>
              <p>{order.address.street}</p>
              <p className="text-gray-600">
                Kec. {order.address.districtName}, {order.address.regencyName}, {order.address.provinceName}{' '}
                {order.address.postalCode}
              </p>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 text-sm shadow-sm">
            <h2 className="mb-2 font-semibold">Pembayaran</h2>
            <p className="text-gray-600">
              {order.payment.provider === 'midtrans' ? 'Midtrans (sandbox)' : 'Simulasi'}
              {order.payment.type && order.payment.type !== order.payment.provider ? ` · ${order.payment.type}` : ''}
              {order.payment.status ? ` · status ${order.payment.status}` : ''}
            </p>
            <p className="text-gray-600">
              {order.payment.paidAt ? `Dibayar ${formatDateTime(order.payment.paidAt)}` : `Batas bayar ${formatDateTime(order.expiresAt)}`}
            </p>
            {order.tracking && (
              <p className="mt-2">
                Resi: <span className="font-medium">{order.tracking.awb}</span>
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <OrderActions orderNumber={order.orderNumber} actions={allowedAdminActions(order.status)} />

          <section className="rounded-xl bg-white p-5 text-sm shadow-sm">
            <h2 className="mb-3 font-semibold">Riwayat status</h2>
            <ol className="space-y-3 border-l-2 border-green-800/30 pl-4">
              {[...order.history].reverse().map((h, i) => (
                <li key={i}>
                  <p className="font-medium">{STATUS_LABEL[h.status]}</p>
                  <p className="text-gray-500">
                    {formatDateTime(h.at)} · oleh {h.by}
                  </p>
                  {h.note && <p className="text-gray-600">{h.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
