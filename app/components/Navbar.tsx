'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, User, MapPin, ShoppingCart } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCart } from '../contexts/cartContext'
import { useUser } from '../contexts/UserContext' // ⬅️ Tambahan

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)

  const lastScrollY = useRef(0)
  const userRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const { cartItems } = useCart()
  const { user, setUser } = useUser() // ⬅️ akses context user

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (userRef.current && !userRef.current.contains(target)) {
        setIsUserDropdownOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false)
      }
      if (mapRef.current && !mapRef.current.contains(target)) {
        setIsMapOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY.current) {
        setShowNavbar(true)
      } else if (currentScrollY > lastScrollY.current + 10) {
        setShowNavbar(false)
        setIsOpen(false)
        setIsUserDropdownOpen(false)
        setIsMapOpen(false)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setIsUserDropdownOpen(false)
    setIsMapOpen(false)
  }, [pathname])

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-white border-b border-gray-300 ${
      showNavbar ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="h-[80px] px-4 md:px-12 grid grid-cols-3 items-center">
        {/* Menu Kiri */}
        <div className="flex justify-start relative" ref={menuRef}>
          <Menu
            className="w-10 h-10 text-black cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <div className="absolute top-14 left-0 bg-white shadow-lg z-50 py-2 w-48 border rounded">
              <Link href="/?scroll=Hero" scroll={false} className="block px-4 py-2 text-black hover:bg-gray-100">
                Main Page
              </Link>
              <Link href="/?scroll=Product" scroll={false} className="block px-4 py-2 text-black hover:bg-gray-100">
                Our Product
              </Link>
              <Link href="/?scroll=Impact" scroll={false} className="block px-4 py-2 text-black hover:bg-gray-100">
                Your Impact
              </Link>
              <Link href="/aboutUs" className="block px-4 py-2 text-black hover:bg-gray-100">
                About Us
              </Link>
            </div>
          )}
        </div>

        {/* Logo Tengah */}
        <div className="flex flex-col items-center justify-center">
          <Image src="/logo.png" alt="logo" width={70} height={40} />
        </div>

        {/* Ikon Kanan */}
        <div className="flex justify-end items-center space-x-4">
          {/* User */}
          <div className="relative" ref={userRef}>
            <User
              className="w-8 h-8 text-black cursor-pointer hover:text-blue-500"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            />
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-6 w-40 bg-white border rounded shadow-md z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700">
                      👋 {user.email}
                    </div>
                    <hr />
                    <button
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                        setUser(null)
                        window.location.href = '/'
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" className="block px-4 py-2 hover:bg-gray-100 text-black">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-4 py-2 hover:bg-gray-100 text-black">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MapPin */}
          <div className="relative" ref={mapRef}>
            <MapPin
              className="w-8 h-8 text-black cursor-pointer hover:text-blue-500"
              onClick={() => setIsMapOpen(!isMapOpen)}
            />
            {isMapOpen && (
              <div className="absolute right-0 top-14 w-[300px] h-[200px] bg-white border rounded shadow-lg z-50">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31653.885725756914!2d108.7939291931394!3d-7.383486130025214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e657ffa1032cf15%3A0x6f0c16fe89347f49!2sCibulu%2C%20Karangreja%2C%20Cipari%2C%20Cilacap%20Regency%2C%20Central%20Java!5e0!3m2!1sen!2sid!4v1751947376494!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  allowFullScreen
                  loading="lazy"
                  className="rounded"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="relative">
            <Link href="/shoppingCart">
              <ShoppingCart className="w-8 h-8 text-black cursor-pointer hover:text-blue-500" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar