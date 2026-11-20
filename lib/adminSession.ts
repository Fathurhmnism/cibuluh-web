/**
 * Sesi admin sederhana: token = base64url(payload).base64url(HMAC-SHA256).
 * Memakai Web Crypto agar bisa dipakai di middleware (edge) dan route (node).
 * Akan diganti sistem auth ber-role di Tahap 3.
 */

export const ADMIN_COOKIE = 'cb_admin'
export const ADMIN_SESSION_HOURS = 8

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export function sessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET
  return secret && secret.length >= 32 ? secret : null
}

export async function createAdminToken(secret: string, now = Date.now()): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ role: 'admin', exp: now + ADMIN_SESSION_HOURS * 3600_000 }))
  )
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(payload))
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifyAdminToken(
  token: string | undefined,
  secret: string,
  now = Date.now()
): Promise<boolean> {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      fromBase64Url(signature) as BufferSource,
      encoder.encode(payload)
    )
    if (!valid) return false
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)))
    return data.role === 'admin' && typeof data.exp === 'number' && data.exp > now
  } catch {
    return false
  }
}

/** Bandingkan password tanpa membocorkan informasi lewat waktu eksekusi */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(input)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ])
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}
