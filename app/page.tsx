'use client'

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

import Hero from './sections/Hero/Hero'
import ProductShowcase from './sections/ProductShowcase/ProductShowcase'
import Impact from './sections/Impact/Impact'
import Stories from './sections/StoriesPage/StoriesPage'
import Footer from './components/Footer'
import Navbar from "./components/Navbar"
import FloatingWhatsapp from "./components/FloatingWhatsapp"

export default function Home() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const target = searchParams.get("scroll")
    if (target) {
      const el = document.getElementById(target)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [searchParams])

  return (
    <>
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