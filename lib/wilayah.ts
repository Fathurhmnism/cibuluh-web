import data from './data/wilayah.json'

// Data wilayah: idn-area-data (ODbL). Dibangun ulang via scripts/build-wilayah.mjs
type Raw = {
  provinces: [string, string][]
  regencies: [string, string, string][]
  districts: [string, string, string][]
}

const raw = data as unknown as Raw

export type Area = { code: string; name: string }

export function listProvinces(): Area[] {
  return raw.provinces.map(([code, name]) => ({ code, name }))
}

export function listRegencies(provinceCode: string): Area[] {
  return raw.regencies
    .filter(([, province]) => province === provinceCode)
    .map(([code, , name]) => ({ code, name }))
}

export function listDistricts(regencyCode: string): Area[] {
  return raw.districts
    .filter(([, regency]) => regency === regencyCode)
    .map(([code, , name]) => ({ code, name }))
}

export type ResolvedAddress = {
  provinceCode: string
  provinceName: string
  regencyCode: string
  regencyName: string
  districtCode: string
  districtName: string
}

/** Validasi bahwa kecamatan benar milik kab/kota dan provinsi yang dipilih */
export function resolveDistrict(districtCode: string): ResolvedAddress | null {
  const district = raw.districts.find(([code]) => code === districtCode)
  if (!district) return null
  const regency = raw.regencies.find(([code]) => code === district[1])
  if (!regency) return null
  const province = raw.provinces.find(([code]) => code === regency[1])
  if (!province) return null
  return {
    provinceCode: province[0],
    provinceName: province[1],
    regencyCode: regency[0],
    regencyName: regency[2],
    districtCode: district[0],
    districtName: district[2],
  }
}
