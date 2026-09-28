import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", // Permite las imágenes del Storage
      },
      {
        protocol: "https",
        hostname: "supabase.com", // Por si traes URLs directas del dashboard
      },
    ],
  },
};

export default nextConfig;  