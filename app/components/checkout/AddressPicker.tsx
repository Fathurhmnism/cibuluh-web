'use client'

import { useEffect, useState } from 'react'

type Area = { code: string; name: string }

async function fetchAreas(query: string): Promise<Area[]> {
  const res = await fetch(`/api/wilayah${query}`)
  if (!res.ok) return []
  return (await res.json()).data
}

const selectClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20 disabled:bg-gray-100 disabled:text-gray-400'

/** Pilih provinsi → kab/kota → kecamatan. Memanggil onChange dengan kode kecamatan. */
export default function AddressPicker({ onChange }: { onChange: (districtCode: string | null) => void }) {
  const [provinces, setProvinces] = useState<Area[]>([])
  const [regencies, setRegencies] = useState<Area[]>([])
  const [districts, setDistricts] = useState<Area[]>([])
  const [province, setProvince] = useState('')
  const [regency, setRegency] = useState('')
  const [district, setDistrict] = useState('')

  useEffect(() => {
    fetchAreas('').then(setProvinces)
  }, [])

  useEffect(() => {
    setRegencies([])
    setRegency('')
    if (province) fetchAreas(`?provinsi=${province}`).then(setRegencies)
  }, [province])

  useEffect(() => {
    setDistricts([])
    setDistrict('')
    if (regency) fetchAreas(`?kabupaten=${regency}`).then(setDistricts)
  }, [regency])

  useEffect(() => {
    onChange(district || null)
  }, [district, onChange])

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="block text-sm font-medium text-gray-700">
        Provinsi
        <select className={`mt-1 ${selectClass}`} value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">Pilih provinsi</option>
          {provinces.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Kabupaten/Kota
        <select
          className={`mt-1 ${selectClass}`}
          value={regency}
          disabled={!province}
          onChange={(e) => setRegency(e.target.value)}
        >
          <option value="">Pilih kab/kota</option>
          {regencies.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Kecamatan
        <select
          className={`mt-1 ${selectClass}`}
          value={district}
          disabled={!regency}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">Pilih kecamatan</option>
          {districts.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
