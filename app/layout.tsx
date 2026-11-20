import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { CartProvider } from "./contexts/cartContext";
import { UserProvider } from "./contexts/UserContext";
import "./globals.css";


export const metadata: Metadata = {
  title: "Cibulu Berdaya — Beras Premium dari Kampung Cibulu",
  description:
    "Beras premium hasil petani Kampung Cibulu. Belanja langsung, dukung kesejahteraan petani lokal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <UserProvider> {/* ⬅️ Bungkus semua */}
          <CartProvider>{children}</CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}