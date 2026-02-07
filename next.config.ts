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
    // ⚡ Otimizações AGRESSIVAS de imagem
    formats: ['image/avif', 'image/webp'], // AVIF primeiro (menor tamanho)
    qualities: [50, 60, 70, 75, 80], // ✅ Configurado explicitamente para evitar warnings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache de 30 dias (máximo)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    unoptimized: false, // Sempre otimizar
  },
  // ⚡ Otimizações gerais
  compress: true, // Compressão gzip/brotli
  poweredByHeader: false,
  // Experimental: Otimizações extras
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;


