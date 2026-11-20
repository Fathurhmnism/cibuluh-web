export type ShippingRate = {
  courier: string // kode, mis. "jne"
  courierName: string // mis. "JNE"
  service: string // kode layanan, mis. "REG"
  serviceName: string // mis. "Reguler"
  cost: number
  etd: string // estimasi, mis. "2-3 hari"
  billableWeightKg: number
}

export type RateRequest = {
  /** Kode kecamatan tujuan (format Kemendagri, mis. 32.75.09) */
  destinationDistrictCode: string
  weightKg: number
}

/**
 * Penyedia ongkir bisa diganti (simulasi, RajaOngkir, Biteship, ...).
 * Cukup implementasikan interface ini lalu daftarkan di lib/shipping/index.ts.
 */
export interface ShippingProvider {
  id: string
  label: string
  getRates(request: RateRequest): Promise<ShippingRate[]>
}
