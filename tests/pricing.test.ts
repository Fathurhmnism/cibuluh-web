import { describe, expect, it } from 'vitest'
import { SEED_PRODUCTS } from '@/lib/catalog'
import { PricingError, priceCart } from '@/lib/pricing'

describe('priceCart', () => {
  it('menghitung kemasan dan curah dengan harga dari katalog', () => {
    const result = priceCart(
      [
        { productId: 'premium-5kg', quantity: 2 },
        { productId: 'premium-curah', quantity: 3 },
      ],
      SEED_PRODUCTS
    )
    expect(result.subtotal).toBe(2 * 88000 + 3 * 17000)
    expect(result.weightKg).toBe(13)
    // Kemasan & curah premium mengambil stok yang sama
    expect(result.stockNeeds.get('premium')).toBe(13)
  })

  it('menggabungkan item ganda untuk produk yang sama', () => {
    const result = priceCart(
      [
        { productId: 'premium-5kg', quantity: 1 },
        { productId: 'premium-5kg', quantity: 2 },
      ],
      SEED_PRODUCTS
    )
    expect(result.lines).toHaveLength(1)
    expect(result.lines[0].quantity).toBe(3)
  })

  it('menolak produk tidak dikenal atau nonaktif', () => {
    expect(() => priceCart([{ productId: 'palsu', quantity: 1 }], SEED_PRODUCTS)).toThrow(PricingError)
    const inactive = SEED_PRODUCTS.map((p) => (p._id === 'premium-5kg' ? { ...p, active: false } : p))
    expect(() => priceCart([{ productId: 'premium-5kg', quantity: 1 }], inactive)).toThrow(PricingError)
  })

  it('menegakkan batas kg untuk curah', () => {
    expect(() => priceCart([{ productId: 'premium-curah', quantity: 101 }], SEED_PRODUCTS)).toThrow(/1–100 kg/)
  })

  it('menolak keranjang kosong dan kuantitas tidak valid', () => {
    expect(() => priceCart([], SEED_PRODUCTS)).toThrow(PricingError)
    expect(() => priceCart([{ productId: 'premium-5kg', quantity: 0 }], SEED_PRODUCTS)).toThrow(PricingError)
    expect(() => priceCart([{ productId: 'premium-5kg', quantity: 1.5 }], SEED_PRODUCTS)).toThrow(PricingError)
  })
})
