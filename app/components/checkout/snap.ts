'use client'

type SnapCallbacks = {
  onSuccess?: () => void
  onPending?: () => void
  onError?: () => void
  onClose?: () => void
}

declare global {
  interface Window {
    snap?: { pay: (token: string, callbacks: SnapCallbacks) => void }
  }
}

const SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js'

let loading: Promise<void> | null = null

/** Muat Snap.js Midtrans sekali saja, hanya saat dibutuhkan */
export function loadSnap(): Promise<void> {
  if (window.snap) return Promise.resolve()
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SNAP_URL
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      reject(new Error('Gagal memuat Midtrans'))
    }
    document.body.appendChild(script)
  })
  return loading
}

/** Buka popup pembayaran; selesai ketika popup ditutup/berhasil/pending */
export async function payWithSnap(token: string): Promise<'success' | 'pending' | 'closed' | 'error'> {
  await loadSnap()
  return new Promise((resolve) => {
    window.snap!.pay(token, {
      onSuccess: () => resolve('success'),
      onPending: () => resolve('pending'),
      onError: () => resolve('error'),
      onClose: () => resolve('closed'),
    })
  })
}
