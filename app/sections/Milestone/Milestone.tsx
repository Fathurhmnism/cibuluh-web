'use client'

import React from 'react'
import styles from './Milestone.module.css'
import { Lightbulb, Zap, Settings, Globe } from 'lucide-react'

const milestones = [
  {
    year: '2025',
    month: 'July',
    title: 'Idea And Initial Concept',
    description: 'Memberdayakan petani melalui pembelian hasil panen dengan harga yang berkeadilan',
    icon: <Lightbulb size={20} />
  },
  {
    year: '2025',
    month: 'August',
    title: 'Beta Launch',
    description: 'Menjamin kualitas produk dengan pengolahan gabah menggunakan teknologi modern dan standar internasional',
    icon: <Zap size={20} />
  },
  {
    year: '2022',
    month: 'September',
    title: 'Introducing Automation',
    description: 'Menghadirkan transparansi dalam setiap tahap pengemasan dan distribusi produk premium',
    icon: <Settings size={20} />
  },
  {
    year: '2022',
    month: 'December',
    title: 'Going Global',
    description: 'Membangun akses pasar langsung yang menghubungkan petani dengan konsumen dan mitra bisnis',
    icon: <Globe size={20} />
  }
]

const Milestone = () => {
  return (
    <section className={styles.section}>
      <div className={styles.leftText}>
        <p className={styles.subtitle}>What we do</p>
        <h2 className={styles.heading}>Kami membangun ekosistem sociopreneur desa yang berkelanjutan dengan menghadirkan solusi
        terintegrasi dari hulu hingga hilir </h2>
      </div>

      <div className={styles.timeline}>
        {milestones.map((item, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.iconBox}>
              {item.icon}
            </div>
            <div className={styles.details}>
              <p className={styles.date}>{item.year} · {item.month}</p>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.description}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Milestone