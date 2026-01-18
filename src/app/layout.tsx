import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ToastProvider } from "@/contexts/ToastContext";
import PWARegister from "@/components/PWARegister";
import { createClient } from '@supabase/supabase-js';
import Script from 'next/script';

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// Função para buscar dados de SEO do banco
async function getSeoSettings() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from('site_settings').select('*').single();
    return data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();

  return {
    title: settings?.site_title || "La Vibe Fit - Moda Fitness e Acessórios",
    description: settings?.site_description || "Sua loja preferida de roupas fitness com estilo e performance. Moda fitness feminina em Manaus.",
    keywords: settings?.keywords?.split(',').map((k: string) => k.trim()) || ['moda fitness', 'manaus'],
    manifest: "/manifest.json",
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    themeColor: '#0052A3',
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: settings?.site_title || 'La Vibe Fit',
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      title: settings?.site_title || "La Vibe Fit",
      description: settings?.site_description,
      locale: 'pt_BR',
      type: 'website',
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSeoSettings();

  // JSON-LD para Negócio Local (SEO Avançado)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: settings?.business_name || 'La Vibe Fit',
    image: 'https://site-lavibefit.vercel.app/logosite.png', // Fallback URL
    description: settings?.site_description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: settings?.city || 'Manaus',
      addressRegion: settings?.state || 'AM',
      addressCountry: 'BR'
    },
    telephone: settings?.phone || '+5592984665689',
    url: 'https://site-lavibefit.vercel.app',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00'
      }
    ]
  };
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.className} ${playfair.variable}`}>
        <PWARegister />
        <ToastProvider>
          <FavoritesProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </FavoritesProvider>
        </ToastProvider>
        <Script
          id="schema-org-local"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
