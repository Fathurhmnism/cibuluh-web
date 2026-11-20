import { Suspense } from 'react'

import Hero from './sections/Hero/Hero'
import ProductShowcase from './sections/ProductShowcase/ProductShowcase'
import Impact from './sections/Impact/Impact'
import Stories from './sections/StoriesPage/StoriesPage'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import FloatingWhatsapp from './components/FloatingWhatsapp'
import ScrollToSection from './components/ScrollToSection'

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>
      <Navbar />
      <Hero />
      <ProductShowcase />
      <Impact />
      <Stories />
      <FloatingWhatsapp />
      <Footer />
    </>
  )
}
