import React from 'react'
import Navbar from "../components/Navbar"
import Milestone from '../sections/Milestone/Milestone'
import Footer from "../components/Footer"
import VisiMisi from '../sections/VisiMisi/VisiMisi'
import CompanyProfileVideos from '../sections/CompanyProfileVideos/CompanyProfileVideos'
import OurTeam from '../sections/OurTeam/OurTeam'
import Dokumentasi from '../sections/Dokumentasi/Dokumentasi'

const aboutUs = () => {
  return (
    <>
    <Navbar />
    <VisiMisi />
    <Milestone />
    <CompanyProfileVideos />
    <OurTeam />
    <Dokumentasi />
    <Footer />
    </>
  )
}

export default aboutUs