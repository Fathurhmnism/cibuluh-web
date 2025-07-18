"use client";

import Image from "next/image";
import { useContext } from "react";
import { useCart } from "../../contexts/cartContext";
import styles from "./ProductShowcase.module.css";

const products = [
  {
    id: 1,
    name: "Beras Premium 5kg",
    desc: "Putih bersih, pulen, dan tahan lama — ideal untuk konsumsi harian keluarga.",
    image: "/5kg.png",
    price: 88000,
  },
  {
    id: 2,
    name: "Beras Organik 10kg",
    desc: "Diproduksi tanpa pestisida, ramah lingkungan dan sehat untuk tubuh.",
    image: "/5kg.png",
    price: 145000,
  },
  {
    id: 3,
    name: "Beras Super Pandan Wangi 5kg",
    desc: "Beras dengan aroma khas pandan, tekstur sangat pulen dan lezat.",
    image: "/5kg.png",
    price: 88000,
  },
];

const ProductShowcase = () => {
  const { addToCart } = useCart();

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
      <div className={styles.grid}>
        {products.map((product) => (
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
              <p className={styles.desc}>{product.desc}</p>
              <p className={styles.price}>
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <button
                className={styles.button}
                onClick={() => addToCart(product)}
              >
                🛒 Add Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductShowcase;
