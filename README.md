# Cibulu Berdaya — Web & Toko Online

Company profile dan toko online beras dari petani Kampung Cibulu. Dibangun dengan **Next.js 15** (App Router), **MongoDB**, dan **Midtrans** (sandbox).

> Proyek portofolio yang dikembangkan ulang secara bertahap. Lihat [Roadmap](#roadmap).

## Fitur

**Pembeli (tanpa perlu akun)**
- Beli beras **kemasan** (5 kg, 10 kg) atau **curah per kg** lewat slider
- Checkout dengan alamat sampai tingkat kecamatan (data wilayah Kemendagri)
- **Ongkir otomatis** per kurir/layanan berdasarkan berat dan tujuan
- Bayar via **Midtrans Snap** (sandbox), atau mode simulasi untuk demo
- **Lacak pesanan** dengan nomor pesanan + email: status, resi, riwayat

**Admin (`/admin`)**
- Ringkasan penjualan 30 hari: omzet, rata-rata pesanan, kg terjual, grafik harian, produk terlaris
- Kelola pesanan: filter status/tanggal, pencarian, input resi, batalkan, riwayat perubahan (audit trail)
- Kelola produk & harga, tampil/sembunyikan produk
- **Kartu stok**: restock & penyesuaian tercatat sebagai mutasi dengan saldo berjalan
- Export pesanan ke **Excel** atau **CSV**

## Alur pesanan

```
                 bayar (webhook Midtrans)        admin input resi       admin konfirmasi
 [Belum Bayar] ───────────────────────────▶ [Dikemas] ─────────────▶ [Dikirim] ─────────────▶ [Selesai]
       │                                        │
       │ tidak dibayar 24 jam /                 │ dibatalkan admin
       │ pembayaran gagal / dibatalkan admin    │ (refund manual)
       ▼                                        ▼
 [Dibatalkan] ◀─────────────────────────────────┘   → stok dikembalikan otomatis
```

Aturan bisnis yang dijaga di server:

| Aturan | Implementasi |
| --- | --- |
| Harga tidak bisa dimanipulasi dari browser | Browser hanya mengirim `productId` + jumlah; harga & ongkir dihitung ulang di server (`lib/pricing.ts`) |
| Stok tidak pernah minus, walau checkout bersamaan | Stok dipesan dalam **transaksi MongoDB** bersama pembuatan pesanan (`lib/orders/service.ts`) |
| Stok kembali tepat sekali saat batal | Flag `stockReleased` + update bersyarat (idempoten) |
| Status hanya bergerak ke langkah yang sah | Tabel transisi di `lib/orders/status.ts` |
| Notifikasi pembayaran asli | Verifikasi signature SHA-512 Midtrans + cocokkan nominal; notifikasi ganda diabaikan |
| Pembayaran masuk setelah pesanan batal | Ditandai **perlu refund manual** di admin |
| Pesanan tak dibayar | Dibatalkan otomatis setelah 24 jam (cron harian + saat pesanan dibuka) |

## Arsitektur

```
app/
  page.tsx               Halaman utama (produk dibaca dari DB)
  shoppingCart/          Keranjang + checkout
  lacak/                 Lacak pesanan
  admin/                 Panel admin (dilindungi middleware)
  api/
    products, wilayah, shipping/rates, checkout, orders/*   ← publik
    midtrans/notification                                    ← webhook
    cron/expire-orders                                       ← Vercel Cron
    admin/*                                                  ← butuh sesi admin
lib/
  catalog.ts             Model produk (kemasan/curah) & jenis beras (stok kg)
  pricing.ts             Perhitungan harga (pure, teruji)
  shipping/              Penyedia ongkir yang bisa diganti (saat ini: simulasi)
  orders/                Status, service (transaksi stok), tampilan publik
  payment.ts             Midtrans Snap, verifikasi signature
  adminSession.ts        Token sesi admin bertanda tangan HMAC
  admin/queries.ts       Query daftar pesanan, ringkasan, export
middleware.ts            Proteksi /admin dan /api/admin
tests/                   Unit test + test integrasi MongoDB
```

**Ongkir** memakai antarmuka `ShippingProvider`. Saat ini tersedia tarif **simulasi** (asal: Jatiasih, Kota Bekasi; 7 zona tujuan). Integrasi RajaOngkir/Biteship cukup menambah satu implementasi di `lib/shipping/`.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Katalog awal (3 jenis beras, 6 produk) dibuat otomatis saat database masih kosong. Tanpa `MIDTRANS_SERVER_KEY`, pembayaran berjalan dalam **mode simulasi**.

### Test

```bash
npm test                                   # unit test
MONGODB_URI_TEST="mongodb://127.0.0.1:27017/?replicaSet=rs0" npm test   # + test integrasi
```

Test integrasi butuh MongoDB replica set (untuk transaksi). Cakupannya: checkout, stok bersamaan, alur status lengkap, pembatalan idempoten, kedaluwarsa, refund, dan lacak pesanan.

## Deploy ke Vercel

1. Import repo ini di Vercel.
2. Isi environment variable sesuai `.env.example`.
3. Deploy. Cron pembatalan otomatis terdaftar dari `vercel.json`.
4. Di Dashboard Midtrans sandbox → *Settings → Payment → Notification URL*, isi:
   `https://<domain-kamu>/api/midtrans/notification`

## Roadmap

- [x] Tahap 1: build bersih, tanpa error lint/type, siap deploy
- [x] Tahap 2: alur bisnis end-to-end (produk & stok di DB, harga di server, ongkir, status pesanan, webhook Midtrans, panel admin, export)
- [ ] Tahap 3: auth ber-role (akun pembeli & admin), rate limiting, CI GitHub Actions
- [ ] Tahap 4: polish UI, akun demo, studi kasus dengan diagram proses (BPMN)

## Kredit data

Data wilayah administratif: [idn-area-data](https://github.com/fityannugroho/idn-area-data), lisensi ODbL. File turunannya ada di `lib/data/wilayah.json` (dibangun dengan `node scripts/build-wilayah.mjs`).
