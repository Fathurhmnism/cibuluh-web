'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/**
 * Keranjang disimpan di localStorage. Nama & harga di sini hanya untuk
 * tampilan — saat checkout server menghitung ulang semuanya dari database.
 */
export type CartItem = {
  productId: string
  kind: 'pack' | 'bulk'
  name: string
  image: string
  unitPrice: number
  /** pack: jumlah kemasan; bulk: jumlah kg */
  quantity: number
  /** pack: berat per kemasan; bulk: 1 */
  kgPerUnit: number
  maxQuantity: number
}

type CartContextType = {
  cartItems: CartItem[]
  ready: boolean
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  weightKg: number
}

const STORAGE_KEY = 'cibulu-cart-v2'

const CartContext = createContext<CartContextType | null>(null)

function clamp(quantity: number, max: number) {
  return Math.min(Math.max(1, Math.round(quantity)), max)
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setCartItems(JSON.parse(saved))
    } catch {
      // abaikan data rusak
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // storage penuh/tidak tersedia
    }
  }, [cartItems, ready])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, ...item, quantity: clamp(i.quantity + quantity, item.maxQuantity) }
            : i
        )
      }
      return [...prev, { ...item, quantity: clamp(quantity, item.maxQuantity) }]
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: clamp(quantity, i.maxQuantity) } : i))
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const clearCart = useCallback(() => setCartItems([]), [])

  const value = useMemo(() => {
    const subtotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const weightKg = cartItems.reduce((s, i) => s + i.kgPerUnit * i.quantity, 0)
    const itemCount = cartItems.reduce((s, i) => s + (i.kind === 'pack' ? i.quantity : 1), 0)
    return { cartItems, ready, addToCart, setQuantity, removeFromCart, clearCart, itemCount, subtotal, weightKg }
  }, [cartItems, ready, addToCart, setQuantity, removeFromCart, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider')
  return ctx
}
