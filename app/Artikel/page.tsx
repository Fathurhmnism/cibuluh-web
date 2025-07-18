'use client'

import Link from 'next/link'
import styles from './Artikel.module.css'

const articles = [
  {
    slug: 'nusron-tegaskan-tak-ada-pulau-dijual',
    title: 'Nusron Tegaskan Tak Ada Pulau yang Bisa Dijual',
    excerpt: 'Nusron Wahid menyatakan bahwa seluruh pulau di Indonesia tidak boleh diperjualbelikan kepada siapapun...',
    image: '/petani1.png',
  },
  {
    slug: 'ayam-goreng-widuran-solo-buka',
    title: 'Ayam Goreng Widuran Solo Buka, Manajemen Buka Suara',
    excerpt: 'Setelah viral, Ayam Goreng Widuran resmi membuka cabang di Solo dengan pengawasan langsung dari pusat...',
    image: '/petani2.png',
  },
  {
    slug: 'kapal-induk-as-matikan-radar-di-indonesia',
    title: 'Kapal Induk AS Matikan Radar di Perairan Indonesia',
    excerpt: 'Insiden kapal induk AS mematikan radar di laut Kalimantan menuai sorotan pemerintah dan pengamat militer...',
    image: '/petani3.png',
  },
  {
    slug: 'jakarta-akan-mirip-singapura-dengan-orchard-road',
    title: 'Jakarta Akan Saingi Orchard Road Singapura',
    excerpt: 'Pemerintah DKI merancang kawasan belanja elite seperti Orchard Road untuk dorong wisata belanja lokal...',
    image: '/petani4.png',
  },
  {
    slug: 'bca-dorong-etika-ai-di-bisnis',
    title: 'BCA Dorong Etika AI dalam Dunia Bisnis',
    excerpt: 'Konferensi data BCA 2025 tekankan pentingnya integritas dan tanggung jawab dalam implementasi AI...',
    image: '/petani5.png',
  },
  {
    slug: 'harga-minyak-naik-karena-konflik',
    title: 'Harga Minyak Dunia Naik karena Konflik Timur Tengah',
    excerpt: 'Konflik baru di Timur Tengah dorong lonjakan harga minyak mentah hingga 3% dalam sehari...',
    image: '/petani6.png',
  },
  {
    slug: 'hoaks-ijazah-presiden',
    title: '[HOAKS] Dugaan Ijazah Palsu Presiden Jokowi',
    excerpt: 'Fakta terbaru menunjukkan tuduhan terhadap ijazah Jokowi adalah palsu dan tidak berdasar...',
    image: '/petani7.png',
  },
  {
    slug: 'kereta-cepat-whoosh-resmi-beroperasi',
    title: 'Kereta Cepat WHOOSH Resmi Beroperasi',
    excerpt: 'Proyek kereta cepat Jakarta-Bandung resmi beroperasi, tiket langsung ludes dalam waktu 3 jam...',
    image: '/petani8.png',
  },
  {
    slug: 'bencana-alam-flores',
    title: 'Banjir dan Longsor Landa Flores Timur',
    excerpt: 'Curah hujan tinggi picu banjir dan longsor di Flores Timur, puluhan rumah rusak berat...',
    image: '/petani9.png',
  },
  {
    slug: 'reuni-akbar-alumni-ui',
    title: 'Reuni Akbar Alumni UI Digelar di GBK',
    excerpt: 'Ribuan alumni Universitas Indonesia hadiri reuni akbar nasional di Stadion GBK dengan semangat kolaborasi...',
    image: '/petani10.png',
  },
]

const Page = () => {
  return (
    <section className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Daftar Artikel</h1>

      <div className={styles.grid}>
        {articles.map((article) => (
          <div key={article.slug} className={styles.card}>
            <img src={article.image} alt={article.title} className={styles.image} />
            <div className={styles.contentBox}>
              <h2 className={styles.title}>{article.title}</h2>
              <p className={styles.excerpt}>{article.excerpt}</p>
              <Link href={`/Artikel/${article.slug}`}>
                <button className={styles.button}>Read More</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Page