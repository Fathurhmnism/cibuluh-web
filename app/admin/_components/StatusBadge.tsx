import { STATUS_LABEL, type OrderStatus } from '@/lib/orders/status'

const STYLE: Record<OrderStatus, string> = {
  BELUM_BAYAR: 'bg-amber-100 text-amber-900',
  DIKEMAS: 'bg-sky-100 text-sky-900',
  DIKIRIM: 'bg-indigo-100 text-indigo-900',
  SELESAI: 'bg-green-100 text-green-900',
  DIBATALKAN: 'bg-gray-200 text-gray-700',
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
