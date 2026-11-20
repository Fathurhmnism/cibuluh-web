import { STATUS_LABEL, type OrderStatus } from '@/lib/orders/status'

const FLOW: OrderStatus[] = ['BELUM_BAYAR', 'DIKEMAS', 'DIKIRIM', 'SELESAI']

/** Penanda tahapan pesanan: Belum Bayar → Dikemas → Dikirim → Selesai */
export default function OrderStatusSteps({ status }: { status: OrderStatus }) {
  if (status === 'DIBATALKAN') {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Pesanan dibatalkan</div>
    )
  }
  const current = FLOW.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Tahapan pesanan">
      {FLOW.map((step, i) => {
        const done = i <= current
        return (
          <li key={step} className="flex flex-col items-center gap-2 text-center">
            <span
              aria-current={i === current ? 'step' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                done ? 'bg-green-800 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </span>
            <span className={`text-xs sm:text-sm ${done ? 'font-medium text-green-900' : 'text-gray-500'}`}>
              {STATUS_LABEL[step]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
