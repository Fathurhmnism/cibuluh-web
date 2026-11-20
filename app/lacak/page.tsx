import { Suspense } from 'react'
import Navbar from '../components/Navbar'
import TrackOrder from './TrackOrder'

export const metadata = { title: 'Lacak Pesanan — Cibulu Berdaya' }

export default function LacakPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-stone-50 px-4 pb-16 pt-28 text-gray-900">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-3xl font-semibold text-green-900">Lacak Pesanan</h1>
          <Suspense fallback={null}>
            <TrackOrder />
          </Suspense>
        </div>
      </main>
    </>
  )
}
