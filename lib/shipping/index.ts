import { simulatedProvider } from './simulated'
import { ShippingProvider, ShippingRate } from './types'

export type { ShippingRate } from './types'

/**
 * Pilih penyedia ongkir lewat env SHIPPING_PROVIDER.
 * Saat ini hanya "simulasi". Integrasi RajaOngkir/Biteship cukup menambah
 * implementasi ShippingProvider baru dan mendaftarkannya di sini.
 */
const PROVIDERS: Record<string, ShippingProvider> = {
  simulasi: simulatedProvider,
}

export function getShippingProvider(): ShippingProvider {
  const id = process.env.SHIPPING_PROVIDER || 'simulasi'
  return PROVIDERS[id] ?? simulatedProvider
}

export function findRate(rates: ShippingRate[], courier: string, service: string) {
  return rates.find((r) => r.courier === courier && r.service === service) ?? null
}
