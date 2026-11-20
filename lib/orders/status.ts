export const ORDER_STATUSES = ['BELUM_BAYAR', 'DIKEMAS', 'DIKIRIM', 'SELESAI', 'DIBATALKAN'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABEL: Record<OrderStatus, string> = {
  BELUM_BAYAR: 'Belum Bayar',
  DIKEMAS: 'Dikemas',
  DIKIRIM: 'Dikirim',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
}

/** Status yang dihitung sebagai penjualan (sudah dibayar) */
export const PAID_STATUSES: OrderStatus[] = ['DIKEMAS', 'DIKIRIM', 'SELESAI']

/** Aksi yang boleh dilakukan admin dari tiap status */
export type AdminAction = 'ship' | 'complete' | 'cancel'

const ADMIN_TRANSITIONS: Record<AdminAction, { from: OrderStatus[]; to: OrderStatus }> = {
  ship: { from: ['DIKEMAS'], to: 'DIKIRIM' },
  complete: { from: ['DIKIRIM'], to: 'SELESAI' },
  cancel: { from: ['BELUM_BAYAR', 'DIKEMAS'], to: 'DIBATALKAN' },
}

export function adminTransition(action: AdminAction) {
  return ADMIN_TRANSITIONS[action]
}

export function allowedAdminActions(status: OrderStatus): AdminAction[] {
  return (Object.keys(ADMIN_TRANSITIONS) as AdminAction[]).filter((a) =>
    ADMIN_TRANSITIONS[a].from.includes(status)
  )
}

/** Batas waktu pembayaran sejak pesanan dibuat */
export const PAYMENT_WINDOW_HOURS = 24
