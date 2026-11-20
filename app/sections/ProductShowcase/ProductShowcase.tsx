"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "../../contexts/cartContext";
import type { ShowcaseProduct } from "@/lib/storefront";
import styles from "./ProductShowcase.module.css";
import { formatRupiah } from "@/lib/format";

const ProductShowcase = ({ products }: { products: ShowcaseProduct[] }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const handleAdd = (product: ShowcaseProduct) => {
    addToCart({
      productId: product.id,
      kind: product.kind,
      name: product.name,
      image: product.image,
      unitPrice: product.unitPrice,
      kgPerUnit: product.kgPerUnit,
      maxQuantity: product.maxQuantity,
    });
    setAdded(product.id);
    setTimeout(() => setAdded((id) => (id === product.id ? null : id)), 1500);
  };

  return (
    <section id="Product" className={styles.section}>
      {/* Headline */}
      <h2 className={styles.headline}>
        Beras Cibulu merupakan beras premium berkualitas tinggi dari Kampung
        Cibulu yang dihasilkan melalui seleksi gabah terbaik dan pengolahan
        dengan teknologi modern. <br />
        Setiap butir beras kami tidak hanya menjamin kualitas unggul—putih
        bersih, tekstur pulen, dan daya tahan optimal—tetapi juga mewujudkan
        komitmen nyata terhadap pemberdayaan petani lokal.
      </h2>

      {/* Produk Grid */}
      {products.length === 0 ? (
        <p className={styles.empty}>Katalog sedang tidak tersedia. Silakan coba beberapa saat lagi.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => {
            const soldOut = product.maxQuantity < 1;
            return (
              <div key={product.id} className={styles.card}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={500}
                  className={styles.image}
                />

                {/* Overlay Konten */}
                <div className={styles.overlay}>
                  <h3 className={styles.title}>{product.name}</h3>
                  <p className={styles.desc}>{product.description}</p>
                  <p className={styles.price}>{formatRupiah(product.unitPrice)}</p>
                  <button
                    className={styles.button}
                    onClick={() => handleAdd(product)}
                    disabled={soldOut}
                  >
                    {soldOut ? "Stok habis" : added === product.id ? "✓ Masuk keranjang" : "🛒 Tambah ke keranjang"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductShowcase;
