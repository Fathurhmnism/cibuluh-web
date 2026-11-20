import { Suspense } from 'react'

import Hero from './sections/Hero/Hero'
import ProductShowcase from './sections/ProductShowcase/ProductShowcase'
import WeightInput from './sections/WeightInput/WeightInput'
import Impact from './sections/Impact/Impact'
import Stories from './sections/StoriesPage/StoriesPage'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import FloatingWhatsapp from './components/FloatingWhatsapp'
import ScrollToSection from './components/ScrollToSection'
import { listStorefrontProducts } from '@/lib/store'
import { toShowcase, type ShowcaseProduct } from '@/lib/storefront'

// Harga & stok selalu terbaru dari database
export const dynamic = 'force-dynamic'

async function loadProducts(): Promise<ShowcaseProduct[]> {
  try {
    return (await listStorefrontProducts()).map(toShowcase)
  } catch (error) {
    console.error('Gagal memuat katalog:', error)
    return []
  }
}

export default async function Home() {
  const products = await loadProducts()

  return (
    <>
      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>
      <Navbar />
      <Hero />
      <ProductShowcase products={products.filter((p) => p.kind === 'pack')} />
      <WeightInput products={products.filter((p) => p.kind === 'bulk')} />
      <Impact />
      <Stories />
      <FloatingWhatsapp />
      <Footer />
    </>
  )
}
