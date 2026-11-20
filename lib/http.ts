import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { OrderError } from './orders/service'
import { firstIssue } from './validation'

/** Ubah error menjadi response JSON yang konsisten tanpa membocorkan detail internal */
export function errorResponse(error: unknown, context: string) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: firstIssue(error) }, { status: 400 })
  }
  if (error instanceof OrderError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error(`[${context}]`, error)
  return NextResponse.json({ error: 'Terjadi kesalahan server. Silakan coba lagi.' }, { status: 500 })
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
