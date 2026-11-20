# Cibulu Berdaya — Web

Company profile dan toko online beras Cibulu Berdaya. Dibangun dengan Next.js 15 (App Router), MongoDB Atlas, dan Midtrans (sandbox).

> Status: proyek portofolio, sedang dikembangkan ulang secara bertahap.
> Tahap 1 (fondasi: build bersih dan siap deploy) selesai.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Buka http://localhost:3000.

## Environment variables

| Nama | Keterangan |
| --- | --- |
| `MONGODB_URI` | Connection string MongoDB Atlas |
| `MIDTRANS_SERVER_KEY` | Server key Midtrans **sandbox** |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client key Midtrans **sandbox** |

## Deploy ke Vercel

1. Import repo ini di Vercel (framework terdeteksi otomatis sebagai Next.js).
2. Isi ketiga environment variable di atas di *Project Settings → Environment Variables*.
3. Deploy.

## Struktur

```
app/
  api/            # Route handler: auth, order, payment
  sections/       # Section halaman utama dan About Us
  components/     # Navbar, Footer, form, dll.
  contexts/       # State keranjang dan user
lib/              # Koneksi MongoDB dan Midtrans
types/            # Deklarasi tipe untuk paket tanpa tipe
```

## Roadmap

- [x] Tahap 1: build bersih, tanpa error lint/type, siap deploy
- [ ] Tahap 2: alur bisnis end-to-end (produk di DB, harga dihitung di server, status pesanan, webhook Midtrans, panel admin)
- [ ] Tahap 3: auth aman dengan role, validasi, automated test, CI
- [ ] Tahap 4: polish UI, akun demo, studi kasus dengan diagram proses
