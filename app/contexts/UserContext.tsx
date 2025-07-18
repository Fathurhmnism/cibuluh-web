'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { usePathname } from 'next/navigation' // ⬅️ Tambahan penting

// 1. Tipe data user
type User = {
  email: string
}

// 2. Tipe context
type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

// 3. Context awal
const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
})

// 4. Provider
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname() // ⬅️ Untuk trigger ulang saat halaman berubah

  useEffect(() => {
    const userEmail = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1]

    if (userEmail) {
      setUser({ email: decodeURIComponent(userEmail) })
    } else {
      setUser(null)
    }
  }, [pathname]) // ⬅️ Jalankan ulang setiap pindah halaman

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

// 5. Hook untuk digunakan di komponen lain
export const useUser = () => useContext(UserContext)