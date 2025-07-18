import React from 'react'
import Image from 'next/image'
import styles from './Impact.module.css'

const Impact = () => {
  return (
    <section id="Impact" className={styles.impact}>
      
      <div className={styles.headline}>
        Di Balik Angka Ada Kehidupan
      </div>

      <div className={styles.content}>
        <div className={styles.left}></div>

        <div className={styles.right}>
          <Image src="/impactt.jpeg" alt="pekerja" fill style={{ objectFit: 'cover' }}/>
        </div>
      </div>
    </section>
  )
}

export default Impact