import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from '../Artikel.module.css'

const articles = [
  {
    slug: 'nusron-tegaskan-tak-ada-pulau-dijual',
    title: 'Nusron Tegaskan Tak Ada Pulau yang Bisa Dijual',
    date: '20 Juni 2025',
    image: '/petani1.png',
    content: `
      Nusron Wahid menyatakan bahwa seluruh pulau di Indonesia tidak boleh diperjualbelikan kepada siapapun.

      Dalam konferensi pers, ia menegaskan bahwa pulau adalah bagian dari kedaulatan nasional dan bukan objek investasi pribadi.

      "Ini bukan sekadar aset geografis, ini adalah identitas negara," katanya.

      Warga dan aktivis pun mendukung langkah ini serta menyerukan audit atas kepemilikan pulau di seluruh Indonesia.
    `,
  },
  {
    slug: 'ayam-goreng-widuran-solo-buka',
    title: 'Ayam Goreng Widuran Solo Buka, Manajemen Buka Suara',
    date: '19 Juni 2025',
    image: '/petani2.png',
    content: `
      Outlet Ayam Goreng Widuran membuka cabang di Solo dan langsung ramai pengunjung.

      Netizen mempertanyakan legalitas operasional, namun manajemen menyatakan bahwa semua prosedur telah dijalankan sesuai SOP pusat.

      "Kami pastikan standar mutu makanan dan pelayanan tetap terjaga," ujar perwakilan manajemen.
    `,
  },
  {
    slug: 'kapal-induk-as-matikan-radar-di-indonesia',
    title: 'Kapal Induk AS Matikan Radar di Perairan Indonesia',
    date: '18 Juni 2025',
    image: '/petani3.png',
    content: `
      Kapal induk AS dilaporkan mematikan radar saat melewati perairan barat Kalimantan.

      Kementerian Pertahanan Indonesia meminta klarifikasi resmi dari Kedubes AS.

      TNI AL meningkatkan patroli untuk mengamankan wilayah dan memastikan tidak ada pelanggaran hukum laut.
    `,
  },
  {
    slug: 'jakarta-akan-mirip-singapura-dengan-orchard-road',
    title: 'Jakarta Akan Saingi Orchard Road Singapura',
    date: '17 Juni 2025',
    image: '/petani4.png',
    content: `
      Pemerintah DKI merencanakan kawasan belanja elite mirip Orchard Road.

      Proyek ini disebut sebagai bagian dari pengembangan Jakarta sebagai kota global.

      Namun pengamat menekankan pentingnya kesiapan infrastruktur transportasi sebelum eksekusi.
    `,
  },
  {
    slug: 'bca-dorong-etika-ai-di-bisnis',
    title: 'BCA Dorong Etika AI dalam Dunia Bisnis',
    date: '16 Juni 2025',
    image: '/petani5.png',
    content: `
      Dalam konferensi teknologi tahunan, BCA mengangkat isu etika dalam pengembangan AI.

      "Kita butuh AI yang bisa dipercaya dan dipertanggungjawabkan," ujar CEO BCA.

      Diskusi panel melibatkan akademisi, regulator, dan pelaku industri.
    `,
  },
  {
    slug: 'harga-minyak-naik-karena-konflik',
    title: 'Harga Minyak Dunia Naik karena Konflik Timur Tengah',
    date: '15 Juni 2025',
    image: '/petani6.png',
    content: `
      Harga minyak mentah dunia naik 3% karena konflik geopolitik baru di Timur Tengah.

      Kenaikan ini berdampak pada biaya logistik dan bahan bakar dalam negeri.

      Pemerintah menyiapkan langkah antisipatif untuk menjaga kestabilan harga BBM.
    `,
  },
  {
    slug: 'hoaks-ijazah-presiden',
    title: '[HOAKS] Dugaan Ijazah Palsu Presiden Jokowi',
    date: '14 Juni 2025',
    image: '/petani7.png',
    content: `
      Isu ijazah palsu Presiden Jokowi dibantah oleh Universitas Gadjah Mada secara resmi.

      Tim hukum presiden juga menyatakan akan menempuh jalur hukum terhadap penyebar hoaks.

      Publik diminta untuk menyaring informasi dengan bijak.
    `,
  },
  {
    slug: 'kereta-cepat-whoosh-resmi-beroperasi',
    title: 'Kereta Cepat WHOOSH Resmi Beroperasi',
    date: '13 Juni 2025',
    image: '/petani8.png',
    content: `
      Kereta cepat WHOOSH resmi melayani rute Jakarta-Bandung dalam 40 menit.

      Tiket perdana habis dalam hitungan jam, menunjukkan animo masyarakat yang tinggi.

      Layanan ini diharapkan mendorong pertumbuhan ekonomi kawasan Jabodetabek–Bandung.
    `,
  },
  {
    slug: 'bencana-alam-flores',
    title: 'Banjir dan Longsor Landa Flores Timur',
    date: '12 Juni 2025',
    image: '/petani9.png',
    content: `
      Hujan deras menyebabkan banjir dan longsor di Flores Timur.

      Pemerintah daerah menetapkan status darurat dan menyalurkan bantuan logistik.

      Warga diminta mengungsi ke posko yang telah disiapkan BPBD.
    `,
  },
  {
    slug: 'reuni-akbar-alumni-ui',
    title: 'Reuni Akbar Alumni UI Digelar di GBK',
    date: '11 Juni 2025',
    image: '/petani10.png',
    content: `
      Alumni Universitas Indonesia dari berbagai angkatan berkumpul di Stadion GBK.

      Acara reuni disemarakkan dengan konser, bazar, dan sesi inspiratif bersama tokoh nasional.

      Panitia berharap acara ini jadi momentum memperkuat jejaring alumni UI.
    `,
  },
]

const Page = ({ params }: { params: { slug: string } }) => {
  const article = articles.find((item) => item.slug === params.slug)
  if (!article) return notFound()

  return (
    <main className={styles.articleWrapper}>
      <img src={article.image} alt={article.title} className={styles.heroImage} />

      <div className={styles.articleContainer}>
        <Link href="/Artikel" className={styles.backLink}>← Kembali ke Artikel</Link>
        <h1 className={styles.articleTitle}>{article.title}</h1>
        <p className={styles.articleDate}>{article.date}</p>

        {article.content
          .trim()
          .split('\n')
          .map((para, index) => (
            <p key={index} className={styles.articleContent}>
              {para.trim()}
            </p>
          ))}
      </div>
    </main>
  )
}

export default Page