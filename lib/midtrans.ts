import midtransClient from 'midtrans-client'

// Mode sandbox (demo). Ganti ke true hanya jika memakai akun production.
const isProduction = false

const serverKey = process.env.MIDTRANS_SERVER_KEY || ''

export const snap = new midtransClient.Snap({ isProduction, serverKey })
