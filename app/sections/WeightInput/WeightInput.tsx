'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './WeightInput.module.css'
import Padi from './Padi.svg'
import { useCart } from '../../contexts/cartContext'
import { formatRupiah } from '@/lib/format'
import type { ShowcaseProduct } from '@/lib/storefront'

/** Beli beras curah per kg dengan slider */
const WeightInput = ({ products }: { products: ShowcaseProduct[] }) => {
  const { addToCart } = useCart()
  const [selectedId, setSelectedId] = useState(products[0]?.id)
  const [weight, setWeight] = useState(5)
  const [added, setAdded] = useState(false)

  const product = products.find((p) => p.id === selectedId) ?? products[0]
  if (!product) return null

  const min = product.minQuantity
  const max = Math.max(min, product.maxQuantity)
  const soldOut = product.maxQuantity < product.minQuantity
  const kg = Math.min(Math.max(weight, min), max)
  const positionPercent = max === min ? 0 : ((kg - min) / (max - min)) * 100

  const handleAdd = () => {
    addToCart(
      {
        productId: product.id,
        kind: 'bulk',
        name: product.name,
        image: product.image,
        unitPrice: product.unitPrice,
        kgPerUnit: 1,
        maxQuantity: product.maxQuantity,
      },
      kg
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <section id="Weight" className={styles.section}>
      <h2 className={styles.headline}>Fleksibel untukmu, stabil untuk mereka.</h2>
      <p className={styles.subheadline}>
        Beli beras curah sesuai kebutuhan. <br /> Pilih jenis beras, lalu geser padi untuk menentukan beratnya.
      </p>

      <div className={styles.varieties} role="radiogroup" aria-label="Jenis beras curah">
        {products.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={p.id === product.id}
            className={p.id === product.id ? styles.varietyActive : styles.variety}
            onClick={() => setSelectedId(p.id)}
          >
            {p.name}
            <span className={styles.varietyPrice}>{formatRupiah(p.unitPrice)}/kg</span>
          </button>
        ))}
      </div>

      <div className={styles.sliderContainer}>
        <input
          type="range"
          min={min}
          max={max}
          value={kg}
          disabled={soldOut}
          aria-label="Berat beras (kg)"
          onChange={(e) => setWeight(parseInt(e.target.value))}
          className={styles.slider}
        />

        <motion.div
          className={styles.iconWrapper}
          style={{ translateX: '-50%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ duration: 0.2 }}
        >
          <Image src={Padi} alt="" width={40} height={40} />
        </motion.div>

        <motion.div
          className={styles.weightLabel}
          style={{ translateX: '-50%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ duration: 0.2 }}
        >
          <span>{kg}</span> <span>KG</span>
        </motion.div>
      </div>

      <p className={styles.priceInfo}>
        {soldOut ? 'Stok sedang habis' : formatRupiah(kg * product.unitPrice)}
      </p>

      <button className={styles.cartBtn} onClick={handleAdd} disabled={soldOut}>
        {added ? '✓ Masuk keranjang' : '🛒 Tambah ke keranjang'}
      </button>
    </section>
  )
}

export default WeightInput
