import type { ObjectId } from 'mongodb'
import type { OrderLine } from '../pricing'
import type { ShippingRate } from '../shipping/types'
import type { ResolvedAddress } from '../wilayah'
import type { OrderStatus } from './status'

export type OrderHistoryEntry = {
  status: OrderStatus
  at: Date
  by: 'sistem' | 'pembeli' | 'admin' | 'midtrans'
  note?: string
}

export type Order = {
  _id?: ObjectId
  orderNumber: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  expiresAt: Date
  customer: { name: string; email: string; phone: string }
  address: ResolvedAddress & { street: string; postalCode: string }
  items: OrderLine[]
  subtotal: number
  weightKg: number
  shipping: ShippingRate & { provider: string }
  total: number
  payment: {
    provider: 'midtrans' | 'simulasi'
    token?: string
    redirectUrl?: string
    status?: string
    type?: string
    transactionId?: string
    paidAt?: Date
    needsRefund?: boolean
  }
  tracking?: { awb: string; shippedAt: Date }
  stockReleased: boolean
  history: OrderHistoryEntry[]
}

export type StockMovement = {
  _id?: ObjectId
  varietyId: string
  deltaKg: number
  reason: 'RESTOCK' | 'PENYESUAIAN' | 'PESANAN' | 'BATAL'
  orderNumber?: string
  note?: string
  by: 'admin' | 'sistem'
  at: Date
  balanceAfterKg?: number
}
