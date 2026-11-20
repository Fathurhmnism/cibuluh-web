'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/** Scroll ke section berdasarkan query ?scroll=<id>, mis. /?scroll=Product */
export default function ScrollToSection() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const target = searchParams?.get('scroll')
    if (!target) return
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
  }, [searchParams])

  return null
}
