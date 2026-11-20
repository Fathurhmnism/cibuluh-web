import type { Order } from './types'

/** Data pesanan yang aman ditampilkan ke pembeli */
export function toPublicOrder(order: Order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    customer: order.customer,
    address: order.address,
    items: order.items,
    subtotal: order.subtotal,
    weightKg: order.weightKg,
    shipping: order.shipping,
    total: order.total,
    payment: {
      provider: order.payment.provider,
      token: order.status === 'BELUM_BAYAR' ? order.payment.token : undefined,
      type: order.payment.type,
      paidAt: order.payment.paidAt,
    },
    tracking: order.tracking,
    history: order.history,
  }
}

export type PublicOrder = ReturnType<typeof toPublicOrder>
