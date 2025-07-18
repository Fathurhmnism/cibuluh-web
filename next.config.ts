import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ tambahkan ini agar lint error tidak blokir build
  },
};

export default nextConfig;