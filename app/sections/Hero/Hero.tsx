'use client'

import React from 'react'
import Link from 'next/link'
import styles from './Hero.module.css'

const Hero = () => {
  return (
    <>
      <section id="Hero" className={styles.hero}>
        <div className={styles.overlay}>
          <div className={styles.content}>
            <p className={styles.text}>
                Cibulu Berdaya adalah sebuah inisiatif sociopreneur yang terletak di Kampung Cibulu, Desa
                Cikembulan, Garut, yang hadir untuk meningkatkan kesejahteraan petani melalui pendekatan
                ekonomi berbasis nilai dan teknologi. Kami menjembatani hasil bumi lokal – khususnya padi
                premium – langsung ke tangan konsumen tanpa perantara merugikan, melalui sistem distribusi
                koperasi dan strategi pemasaran digital berbasis storytelling.
            </p>
            <Link href="/aboutUs" className={styles.button}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero