'use client'

import React from 'react'
import Image from 'next/image'
import styles from './Dokumentasi.module.css'

const topImages = [
  '/petani1.png',
  '/petani2.png',
  '/petani3.png',
  '/petani4.png',
  '/petani5.png'
]

const bottomImages = [
  '/petani6.png',
  '/petani7.png',
  '/petani8.png',
  '/petani9.png',
  '/petani10.png'
]

const Dokumentasi = () => {
  return (
    <section className={styles.documentationSection}>
      <h2 className={styles.title}>DOCUMENTATION</h2>

      {/* Baris Atas: kanan ke kiri */}
      <div className={`${styles.scroller} ${styles.reverse}`}>
        <div className={styles.track}>
          {topImages.concat(topImages).map((src, index) => (
            <div key={`top-${index}`} className={styles.card}>
              <Image src={src} alt={`Documentation ${index + 1}`} fill className={styles.image} />
            </div>
          ))}
        </div>
      </div>

      {/* Baris Bawah: kiri ke kanan */}
      <div className={styles.scroller}>
        <div className={styles.track}>
          {bottomImages.concat(bottomImages).map((src, index) => (
            <div key={`bottom-${index}`} className={styles.card}>
              <Image src={src} alt={`Documentation ${index + 6}`} fill className={styles.image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Dokumentasi