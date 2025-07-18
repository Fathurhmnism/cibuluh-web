import React from 'react'
import Image from 'next/image'
import styles from "./OurTeam.module.css"

const teamMembers = [
  {
    name: 'M Fathur Rahman Ismail',
    position: 'Digital Marketing',
    image: '/fathur.jpg'
  },
  {
    name: 'Adrian Taqi',
    position: 'COO',
    image: '/taki.jpg'
  },
  {
    name: 'Raka Razienulhaq',
    position: 'CEO',
    image: '/raka.jpg'
  },
  {
    name: 'Apta Raditya',
    position: 'CFO',
    image: '/apta.png'
  },

  {
    name: 'Ahmad Nabiel Kafif',
    position: 'Ome Master',
    image: '/kapip2.jpg'
  }
]

const OurTeam = () => {
  return (
    <section className={styles.ourTeamSection}>
      <h2 className={styles.title}>Our Team</h2>
      <div className={styles.teamGrid}>
        {teamMembers.map((member, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image src={member.image} alt={member.name} fill className={styles.image} />
            </div>
            <div className={styles.info}>
              <h3 className={styles.name}>{member.name}</h3>
              <p className={styles.position}>{member.position}</p>
            </div>
          </div>
        ))}
      </div>
      <p className={styles.description}>
        Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries.
      </p>
    </section>
  )
}

export default OurTeam