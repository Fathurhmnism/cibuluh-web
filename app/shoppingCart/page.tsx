'use client'

import Image from 'next/image'
import Script from 'next/script'
import { Plus, Minus, X } from 'lucide-react'
import { useCart } from '../contexts/cartContext'
import styles from './ShoppingCart.module.css'

declare global {
  interface Window {
    snap: any
  }
}

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart()

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Keranjang masih kosong!')
      return
    }

    const orderId = `ORDER-${Date.now()}`

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items: cartItems,
          total,
          customer: {
            first_name: 'Cibulu',
            email: 'cibulu@berdaya.id',
          },
        }),
      })

      const data = await res.json()

      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function () {
            try {
              // Ambil status terbaru dan simpan hanya jika status = 'settlement' atau 'capture'
              const statusRes = await fetch(`/api/payment/status?orderId=${orderId}`)
              const statusData = await statusRes.json()

              if (
                statusData.transaction_status === 'settlement' ||
                statusData.transaction_status === 'capture'
              ) {
                alert(`✅ Pembayaran berhasil! Status: ${statusData.transaction_status}`)
              } else {
                alert(`ℹ️ Transaksi belum diselesaikan. Status: ${statusData.transaction_status}`)
              }
            } catch (err) {
              alert('Pembayaran berhasil, tapi gagal update status ke database.')
            }
          },
          onPending: function () {
            alert('🕐 Transaksi masih menunggu pembayaran.')
          },
          onError: function () {
            alert('❌ Terjadi kesalahan dalam pembayaran.')
          },
          onClose: function () {
            alert('⚠️ Kamu menutup popup sebelum menyelesaikan pembayaran.')
          },
        })
      } else {
        alert('❌ Gagal mendapatkan token pembayaran.')
      }
    } catch (error) {
      console.error('❌ Error saat checkout:', error)
      alert('Terjadi kesalahan saat proses pembayaran.')
    }
  }

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className={styles.container}>
        <h1 className={styles.title}>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className={styles.empty}>Your cart is empty.</p>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                  />
                </div>

                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <p className={styles.itemDesc}>{item.desc}</p>
                </div>

                <div className={styles.price}>
                  Rp {item.price.toLocaleString('id-ID')}
                </div>

                <div className={styles.quantity}>
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    <Minus className={styles.icon} />
                  </button>
                  <span className={styles.qtyText}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <Plus className={styles.icon} />
                  </button>
                  <span className={styles.stock}>
                    IN-STOCK: <span className={styles.stockNumber}>7</span>
                  </span>
                </div>

                <div className={styles.subtotal}>
                  Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2"
                  title="Remove item"
                >
                  <X className="w-5 h-5 text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total :</span>
              <span className={styles.totalValue}>
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>

            <div className={styles.checkoutWrapper}>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Check Out
              </button>
            </div>
          </>
        )}

        <div className={styles.altCheckoutWrapper}>
          <p className={styles.altCheckoutLabel}>
            <b>Or Checkout From:</b>
          </p>
          <div className={styles.altCheckoutIcons}>
            <a
              href="https://shopee.co.id/namatoko"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/shopee-.png" alt="Shopee" width={80} height={40} />
            </a>
            <a
              href="https://www.tokopedia.com/cibulu-berdaya"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/tokopedia.jpg" alt="Tokopedia" width={80} height={40} />
            </a>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/whatsapp.png" alt="WhatsApp" width={80} height={40} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShoppingCart