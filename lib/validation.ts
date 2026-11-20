import { z } from 'zod'

const cartItem = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(1000),
})

export const cartSchema = z.array(cartItem).min(1, 'Keranjang kosong').max(50)

export const ratesRequestSchema = z.object({
  districtCode: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Kecamatan tidak valid'),
  items: cartSchema,
})

export const checkoutSchema = z.object({
  items: cartSchema,
  customer: z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80),
    email: z.string().trim().toLowerCase().email('Email tidak valid').max(120),
    phone: z
      .string()
      .trim()
      .regex(/^(\+62|62|0)8\d{7,12}$/, 'Nomor HP tidak valid (contoh: 0812xxxxxxx)'),
  }),
  address: z.object({
    districtCode: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Pilih kecamatan'),
    street: z.string().trim().min(10, 'Alamat lengkap minimal 10 karakter').max(300),
    postalCode: z.string().trim().regex(/^\d{5}$/, 'Kode pos harus 5 digit'),
  }),
  shipping: z.object({
    courier: z.string().min(1).max(20),
    service: z.string().min(1).max(20),
  }),
})

export const lookupSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().regex(/^CB-\d{8}-\d{4,}$/, 'Nomor pesanan tidak valid'),
  email: z.string().trim().toLowerCase().email('Email tidak valid'),
})

export const adminOrderActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('ship'), awb: z.string().trim().min(5, 'Nomor resi wajib diisi').max(40) }),
  z.object({ action: z.literal('complete') }),
  z.object({ action: z.literal('cancel'), note: z.string().trim().min(3, 'Alasan pembatalan wajib diisi').max(200) }),
])

export const productUpdateSchema = z.object({
  name: z.string().trim().min(3).max(80).optional(),
  description: z.string().trim().max(300).optional(),
  price: z.number().int().min(1000).max(10_000_000).optional(),
  pricePerKg: z.number().int().min(1000).max(1_000_000).optional(),
  active: z.boolean().optional(),
})

export const stockMovementSchema = z.object({
  varietyId: z.string().min(1).max(64),
  reason: z.enum(['RESTOCK', 'PENYESUAIAN']),
  deltaKg: z
    .number()
    .refine((v) => Number.isFinite(v) && v !== 0, 'Jumlah tidak boleh 0')
    .refine((v) => Math.abs(v) <= 100_000, 'Jumlah terlalu besar'),
  note: z.string().trim().max(200).optional(),
})

/** Ambil pesan error pertama yang mudah dibaca dari hasil zod */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Data tidak valid'
}
