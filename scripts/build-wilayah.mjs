// Membangun lib/data/wilayah.json (provinsi, kabupaten/kota, kecamatan) dari paket
// idn-area-data. Data wilayah © idn-area-data, lisensi ODbL.
// Jalankan: node scripts/build-wilayah.mjs
import { writeFileSync } from 'node:fs'
import { getProvinces, getRegencies, getDistricts } from 'idn-area-data'

const provinces = (await getProvinces()).map((p) => [p.code, p.name])
const regencies = (await getRegencies()).map((r) => [r.code, r.province_code, r.name])
const districts = (await getDistricts()).map((d) => [d.code, d.regency_code, d.name])

writeFileSync(
  new URL('../lib/data/wilayah.json', import.meta.url),
  JSON.stringify({ source: 'idn-area-data (ODbL)', provinces, regencies, districts })
)
console.log(`provinsi ${provinces.length}, kab/kota ${regencies.length}, kecamatan ${districts.length}`)
