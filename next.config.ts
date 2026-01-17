import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'jcytqknxxcqkfraonhwr.supabase.co',
      },
    ],
    // Otimizações de imagem
    formats: ['image/webp', 'image/avif'], // Formatos modernos e mais leves
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Tamanhos responsivos
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamanhos para ícones
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache de 30 dias
    qualities: [60, 75, 85, 90, 100], // Qualidades permitidas
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Otimizações gerais
  compress: true, // Compressão gzip
  poweredByHeader: false, // Remove header desnecessário
};

export default nextConfig;
