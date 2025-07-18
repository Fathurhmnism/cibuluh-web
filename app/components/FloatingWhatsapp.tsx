'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'

const FloatingWhatsapp = () => {
  return (
    <Link
      href="https://wa.me/6282215311690"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition duration-300 ease-in-out"
    >
      <MessageCircle className="w-6 h-6" />
    </Link>
  )
}

export default FloatingWhatsapp
