import React from 'react'
import styles from "./CompanyProfileVideos.module.css"

const CompanyProfileVideos = () => {
  return (
    <section className={styles.companySection}>
      <div className={styles.videoWrapper}>
        <iframe
          className={styles.video}
          src="https://www.youtube.com/embed/5CYgmFaFPv8?autoplay=1&mute=1&controls=0&loop=1&playlist=5CYgmFaFPv8"
          title="Company Profile Video"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>

    
  )
}

export default CompanyProfileVideos