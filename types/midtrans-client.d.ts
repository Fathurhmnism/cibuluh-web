// Deklarasi minimal untuk midtrans-client (paket resmi belum menyertakan tipe).
declare module 'midtrans-client' {
  type SnapOptions = { isProduction: boolean; serverKey: string; clientKey?: string }

  type TransactionStatus = {
    transaction_status: string
    payment_type?: string
    fraud_status?: string
    transaction_time?: string
    settlement_time?: string
    va_numbers?: { bank: string; va_number: string }[]
    [key: string]: unknown
  }

  export class Snap {
    constructor(options: SnapOptions)
    createTransaction(parameter: Record<string, unknown>): Promise<{ token: string; redirect_url: string }>
    transaction: {
      status(orderId: string): Promise<TransactionStatus>
      cancel(orderId: string): Promise<TransactionStatus>
      notification(body: Record<string, unknown>): Promise<TransactionStatus>
    }
  }

  const midtransClient: { Snap: typeof Snap }
  export default midtransClient
}
