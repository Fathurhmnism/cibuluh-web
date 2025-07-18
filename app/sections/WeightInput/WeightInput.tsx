'use client'

import React, { useState } from 'react'
import styles from './WeightInput.module.css'
import Image from 'next/image'
import Padi from './Padi.svg'
import { motion } from 'framer-motion'

const WeightInput = () => {
  const [weight, setWeight] = useState(1)

  // Hitung posisi padi dan label dalam persen
  const positionPercent = ((weight - 1) / 99) * 100

  return (
    <section id="Weight" className={styles.section}>
      <h2 className={styles.headline}>Fleksibel untukmu, stabil untuk mereka.</h2>
      <p className={styles.subheadline}>
        Geserkan padi untuk memilih berat <br /> beras yang akan anda beli !
      </p>

      <div className={styles.sliderContainer}>
        <input
          type="range"
          min="1"
          max="100"
          value={weight}
          onChange={(e) => setWeight(parseInt(e.target.value))}
          className={styles.slider}
        />

        {/* Ikon padi */}
        <motion.div
          className={styles.iconWrapper}
          style={{ translateX: '-50%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ duration: 0.2 }}
        >
          <Image src={Padi} alt="Padi" width={40} height={40} />
        </motion.div>

        {/* Label berat */}
        <motion.div
          className={styles.weightLabel}
          style={{ translateX: '-50%' }}
          animate={{ left: `${positionPercent}%` }}
          transition={{ duration: 0.2 }}
        >
          <span>{weight}</span> <span>KG</span>
        </motion.div>
      </div>

      <button className={styles.cartBtn}>🛒</button>
    </section>
  )
}

export default WeightInput