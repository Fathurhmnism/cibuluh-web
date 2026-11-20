import { NextRequest, NextResponse } from 'next/server'
import { listDistricts, listProvinces, listRegencies } from '@/lib/wilayah'

// GET /api/wilayah                 → daftar provinsi
// GET /api/wilayah?provinsi=32     → kab/kota di provinsi
// GET /api/wilayah?kabupaten=32.75 → kecamatan di kab/kota
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const provinsi = params.get('provinsi')
  const kabupaten = params.get('kabupaten')

  const data = kabupaten
    ? listDistricts(kabupaten)
    : provinsi
      ? listRegencies(provinsi)
      : listProvinces()

  return NextResponse.json(
    { data },
    { headers: { 'Cache-Control': 'public, max-age=86400, immutable' } }
  )
}
