import React from 'react'
import styles from './StoriesPage.module.css'
import Image from 'next/image'
import Link from 'next/link'

const StoriesPage = () => {
  return (
    <section id="Stories" className={styles.container}>
      <div className={styles.headline}>Cerita Dari Lapangan</div>

      <div className={styles.box}>
        <Image src="/petani1.png" alt="Petani 1" width={300} height={200}/>
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
        <Image src="/petani2.png" alt="Petani 2" width={300} height={200} />
      </div>

      <div className={styles.box}>
        <Image src="/petani3.png" alt="Petani 1" width={300} height={200} />
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
        <Image src="/petani4.png" alt="Petani 2" width={300} height={200} />
      </div>

      <div className={styles.box}>
        <Image src="/petani5.png" alt="Petani 1" width={300} height={200} />
        <div className={styles.news}>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>

        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
        <Image src="/petani6.png" alt="Petani 2" width={300} height={200} />
      </div>

      <div className={styles.box}>
        <Image src="/petani7.png" alt="Petani 1" width={300} height={200} />
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.news}>
          <h4>News</h4>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
            <Link href="/Artikel" className={styles.readMore}>
            Read More
            </Link>
        </div>
        <Image src="/petani8.png" alt="Petani 2" width={300} height={200} />
      </div>
    </section>
  )
}

export default StoriesPage
