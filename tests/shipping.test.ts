import { describe, expect, it } from 'vitest'
import { simulateRates, zoneFor } from '@/lib/shipping/simulated'
import { resolveDistrict, listRegencies } from '@/lib/wilayah'

describe('zona ongkir simulasi (asal Jatiasih, Kota Bekasi)', () => {
  it('memetakan tujuan ke zona yang benar', () => {
    expect(zoneFor('32.75.01')).toBe(0) // Kota Bekasi
    expect(zoneFor('31.71.01')).toBe(1) // Jakarta Pusat
    expect(zoneFor('32.76.01')).toBe(1) // Depok
    expect(zoneFor('32.73.01')).toBe(2) // Kota Bandung
    expect(zoneFor('35.78.01')).toBe(3) // Surabaya
    expect(zoneFor('51.71.01')).toBe(4) // Denpasar
    expect(zoneFor('73.71.01')).toBe(5) // Makassar
    expect(zoneFor('94.71.01')).toBe(6) // Papua
  })

  it('ongkir naik seiring berat dan jarak, dibulatkan ke Rp500', () => {
    const near = simulateRates({ destinationDistrictCode: '31.71.01', weightKg: 5 })
    const far = simulateRates({ destinationDistrictCode: '73.71.01', weightKg: 5 })
    const heavy = simulateRates({ destinationDistrictCode: '31.71.01', weightKg: 10 })
    const reg = (r: typeof near) => r.find((x) => x.courier === 'jne' && x.service === 'REG')!
    expect(reg(far).cost).toBeGreaterThan(reg(near).cost)
    expect(reg(heavy).cost).toBeGreaterThan(reg(near).cost)
    for (const r of near) expect(r.cost % 500).toBe(0)
  })

  it('berat dibulatkan ke atas dan kargo minimal 10 kg', () => {
    const rates = simulateRates({ destinationDistrictCode: '31.71.01', weightKg: 2.2 })
    expect(rates.find((r) => r.service === 'REG')!.billableWeightKg).toBe(3)
    expect(rates.find((r) => r.service === 'GOKIL')!.billableWeightKg).toBe(10)
  })

  it('layanan YES tidak tersedia untuk zona terjauh', () => {
    const rates = simulateRates({ destinationDistrictCode: '94.71.01', weightKg: 1 })
    expect(rates.some((r) => r.service === 'YES')).toBe(false)
  })
})

describe('data wilayah', () => {
  it('memvalidasi kecamatan beserta induknya', () => {
    expect(resolveDistrict('32.75.09')).toMatchObject({
      districtName: 'Jatiasih',
      regencyName: 'Kota Bekasi',
      provinceName: 'Jawa Barat',
    })
    expect(resolveDistrict('99.99.99')).toBeNull()
    expect(listRegencies('32').length).toBeGreaterThan(20)
  })
})
