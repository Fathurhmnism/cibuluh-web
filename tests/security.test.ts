import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { createAdminToken, passwordMatches, verifyAdminToken } from '@/lib/adminSession'
import { interpretMidtransStatus, verifyMidtransSignature } from '@/lib/payment'
import { allowedAdminActions } from '@/lib/orders/status'

const SECRET = 'x'.repeat(40)

describe('sesi admin', () => {
  it('token valid bisa diverifikasi', async () => {
    expect(await verifyAdminToken(await createAdminToken(SECRET), SECRET)).toBe(true)
  })

  it('menolak token yang diubah, secret lain, atau kedaluwarsa', async () => {
    const token = await createAdminToken(SECRET)
    const [payload, sig] = token.split('.')
    expect(await verifyAdminToken(`${payload}x.${sig}`, SECRET)).toBe(false)
    expect(await verifyAdminToken(token, 'y'.repeat(40))).toBe(false)
    expect(await verifyAdminToken(token, SECRET, Date.now() + 9 * 3600_000)).toBe(false)
    expect(await verifyAdminToken(undefined, SECRET)).toBe(false)
  })

  it('membandingkan password', async () => {
    expect(await passwordMatches('rahasia', 'rahasia')).toBe(true)
    expect(await passwordMatches('rahasiA', 'rahasia')).toBe(false)
  })
})

describe('notifikasi Midtrans', () => {
  const serverKey = 'SB-Mid-server-test'
  const body = { order_id: 'CB-20261120-0001', status_code: '200', gross_amount: '105500.00' }
  const signature = createHash('sha512')
    .update(body.order_id + body.status_code + body.gross_amount + serverKey)
    .digest('hex')

  it('menerima signature yang benar dan menolak yang salah', () => {
    expect(verifyMidtransSignature({ ...body, signature_key: signature }, serverKey)).toBe(true)
    expect(verifyMidtransSignature({ ...body, gross_amount: '1.00', signature_key: signature }, serverKey)).toBe(false)
    expect(verifyMidtransSignature({ ...body, signature_key: signature }, '')).toBe(false)
  })

  it('menerjemahkan status transaksi', () => {
    expect(interpretMidtransStatus('settlement')).toBe('paid')
    expect(interpretMidtransStatus('capture', 'accept')).toBe('paid')
    expect(interpretMidtransStatus('capture', 'challenge')).toBe('pending')
    expect(interpretMidtransStatus('expire')).toBe('failed')
    expect(interpretMidtransStatus('pending')).toBe('pending')
  })
})

describe('transisi status oleh admin', () => {
  it('hanya mengizinkan langkah yang sah', () => {
    expect(allowedAdminActions('BELUM_BAYAR')).toEqual(['cancel'])
    expect(allowedAdminActions('DIKEMAS')).toEqual(['ship', 'cancel'])
    expect(allowedAdminActions('DIKIRIM')).toEqual(['complete'])
    expect(allowedAdminActions('SELESAI')).toEqual([])
    expect(allowedAdminActions('DIBATALKAN')).toEqual([])
  })
})
