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
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache de 7 dias (otimizado)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Loader customizado para melhor performance
    loader: 'default',
    // Desabilitar otimização automática em dev para velocidade
    unoptimized: process.env.NODE_ENV === 'development' ? false : false,
  },
  // Otimizações gerais
  compress: true, // Compressão gzip
  poweredByHeader: false, // Remove header desnecessário
};

export default nextConfig;


