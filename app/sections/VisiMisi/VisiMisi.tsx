'use client'

import Image from 'next/image'
import styles from './VisiMisi.module.css'

const VisiMisi = () => {
  return (
    <section className={styles.wrapper}>
      {/* VISION - Kiri Atas */}
      <div className={`${styles.card} ${styles.blue}`}>
        <Image
          src="/petani8.png"
          alt="Visi"
          fill
          className={styles.image}
        />
        <div className={`${styles.overlay} ${styles.topLeft}`}>
          <h2 className={styles.title}>Our Vision</h2>
          <p className={styles.subtitle}></p>
        </div>
      </div>

      {/* MISSION - Kanan Bawah */}
      <div className={`${styles.card} ${styles.orange}`}>
        <Image
          src="/petani3.png"
          alt="Misi"
          fill
          className={styles.image}
        />
        <div className={`${styles.overlay} ${styles.bottomRight}`}>
          <h2 className={styles.title}>Our Mission</h2>
          <p className={styles.subtitle}></p>
        </div>
      </div>
    </section>
  )
}

export default VisiMisi