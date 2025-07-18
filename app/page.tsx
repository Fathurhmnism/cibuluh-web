'use client'

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

import Image from "next/image"
import Link from "next/link"
import Hero from './sections/Hero/Hero'
import ProductShowcase from './sections/ProductShowcase/ProductShowcase'
import WeightInput from './sections/WeightInput/WeightInput'
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
      {/* <WeightInput /> */}
      <Impact />
      <Stories />
      <FloatingWhatsapp />
      <Footer />
    </>
  )
}