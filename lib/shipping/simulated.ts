import { RateRequest, ShippingProvider, ShippingRate } from './types'

/**
 * Tarif SIMULASI — bukan tarif resmi kurir.
 * Asal pengiriman: Kec. Jatiasih, Kota Bekasi (32.75.09).
 * Tarif dihitung dari zona tujuan × berat (dibulatkan ke atas per kg).
 */

export const ORIGIN = {
  districtCode: '32.75.09',
  label: 'Jatiasih, Kota Bekasi, Jawa Barat',
}

export type Zone = 0 | 1 | 2 | 3 | 4 | 5 | 6

const JABODETABEK_REGENCIES = new Set([
  '32.01', // Kab. Bogor
  '32.71', // Kota Bogor
  '32.76', // Kota Depok
  '32.16', // Kab. Bekasi
  '36.03', // Kab. Tangerang
  '36.71', // Kota Tangerang
  '36.74', // Kota Tangerang Selatan
])

export function zoneFor(districtCode: string): Zone {
  const regency = districtCode.slice(0, 5)
  const province = districtCode.slice(0, 2)
  if (regency === ORIGIN.districtCode.slice(0, 5)) return 0 // dalam kota
  if (province === '31' || JABODETABEK_REGENCIES.has(regency)) return 1 // Jabodetabek
  if (province === '32' || province === '36') return 2 // Jabar & Banten
  if (['33', '34', '35'].includes(province)) return 3 // Jawa lainnya
  const p = Number(province)
  if ((p >= 11 && p <= 21) || p === 51 || p === 52) return 4 // Sumatra, Bali, NTB
  if ((p >= 61 && p <= 65) || (p >= 71 && p <= 76)) return 5 // Kalimantan, Sulawesi
  return 6 // NTT, Maluku, Papua
}

/** Tarif dasar per kg (layanan reguler) per zona */
const BASE_PER_KG: Record<Zone, number> = {
  0: 5000,
  1: 7000,
  2: 9000,
  3: 11000,
  4: 18000,
  5: 25000,
  6: 45000,
}

const ETD_REGULAR: Record<Zone, [number, number]> = {
  0: [1, 1],
  1: [1, 2],
  2: [2, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
  6: [5, 9],
}

type ServiceDef = {
  courier: string
  courierName: string
  service: string
  serviceName: string
  multiplier: number
  etdShift: number // + hari dibanding reguler (negatif = lebih cepat)
  maxZone?: Zone // layanan hanya tersedia sampai zona ini
}

const SERVICES: ServiceDef[] = [
  { courier: 'jne', courierName: 'JNE', service: 'REG', serviceName: 'Reguler', multiplier: 1, etdShift: 0 },
  { courier: 'jne', courierName: 'JNE', service: 'YES', serviceName: 'Yakin Esok Sampai', multiplier: 1.8, etdShift: -9, maxZone: 4 },
  { courier: 'jnt', courierName: 'J&T Express', service: 'EZ', serviceName: 'Reguler', multiplier: 0.95, etdShift: 0 },
  { courier: 'sicepat', courierName: 'SiCepat', service: 'GOKIL', serviceName: 'Kargo (min. 10 kg)', multiplier: 0.55, etdShift: 2 },
]

function roundUpTo500(value: number) {
  return Math.ceil(value / 500) * 500
}

export function simulateRates(request: RateRequest): ShippingRate[] {
  const zone = zoneFor(request.destinationDistrictCode)
  const billable = Math.max(1, Math.ceil(request.weightKg))
  const [etdMin, etdMax] = ETD_REGULAR[zone]

  return SERVICES.filter((s) => s.maxZone === undefined || zone <= s.maxZone).map((s) => {
    // Kargo punya berat minimum 10 kg
    const weight = s.service === 'GOKIL' ? Math.max(10, billable) : billable
    const min = Math.max(1, etdMin + s.etdShift)
    const max = Math.max(1, etdMax + s.etdShift)
    return {
      courier: s.courier,
      courierName: s.courierName,
      service: s.service,
      serviceName: s.serviceName,
      cost: roundUpTo500(BASE_PER_KG[zone] * s.multiplier * weight),
      etd: min === max ? `${min} hari` : `${min}-${max} hari`,
      billableWeightKg: weight,
    }
  })
}

export const simulatedProvider: ShippingProvider = {
  id: 'simulasi',
  label: 'Tarif simulasi',
  async getRates(request) {
    return simulateRates(request)
  },
}
