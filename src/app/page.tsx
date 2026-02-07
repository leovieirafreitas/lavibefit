import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { getCachedHomeContent, getCachedSettings, getCachedProducts } from "@/lib/supabaseCache";

async function getHomeData() {
  // ⚡ Fetch all data in parallel with CACHE for blazing fast performance
  const [homeContent, settings, products] = await Promise.all([
    getCachedHomeContent(),
    getCachedSettings('top_bar_text'),
    getCachedProducts({ limit: 4 })
  ]);

  return {
    homeContent: homeContent || [],
    topBarText: settings?.value,
    initialProducts: products || []
  };
}

export default async function Home() {
  const { homeContent: allContent, topBarText, initialProducts } = await getHomeData();

  // Find specific blocks by ID or fallback to defaults
  const promoBlock = allContent.find(c => c.id === 1) || {
    title: "COMBO TREINO",
    subtitle: "COMPLETO",
    pre_title: "OFERTA ESPECIAL",
    description: "Leve 3 peças pagando apenas 2. A promoção é válida para produtos selecionados da nova coleção.",
    button_text: "APROVEITAR DESCONTO",
    image_url: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=2626&auto=format&fit=crop"
  };

  const arrivalsBlock = allContent.find(c => c.id === 2) || {
    image_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2670&auto=format&fit=crop",
    link_url: "/lancamentos"
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar initialTopBarText={topBarText} />
      <Hero />
      <ProductGrid initialProducts={initialProducts} />

      {/* --- SECTION 1: NEW ARRIVALS (BLUE BANNER) --- */}
      {/* Agora controlado pelo ID 2 da tabela home_content */}
      {arrivalsBlock.active !== false && (
        <section className="w-full relative group">
          <Link href={arrivalsBlock.link_url || '/lancamentos'} className="block w-full h-full relative">
            {/* Desktop Image */}
            <div className="hidden md:block w-full relative">
              {arrivalsBlock.image_url ? (
                <Image
                  src={arrivalsBlock.image_url}
                  alt="Lançamentos"
                  width={1920}
                  height={600}
                  className="w-full h-auto"
                  quality={60}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-[600px] bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">BANNER LANÇAMENTOS (Sem Imagem)</div>
              )}
            </div>

            {/* Mobile Image (Optional Fallback to Desktop) */}
            <div className="block md:hidden w-full aspect-[4/5] relative">
              {arrivalsBlock.mobile_image_url || arrivalsBlock.image_url ? (
                <Image
                  src={arrivalsBlock.mobile_image_url || arrivalsBlock.image_url!}
                  alt="Lançamentos"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  quality={60}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">BANNER MOBILE</div>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* --- SECTION 2: PROMO (BLACK BANNER) --- */}
      {/* Agora controlado pelo ID 1 da tabela home_content */}
      {promoBlock.active !== false && (
        <section className="py-20 bg-gray-50 relative">
          <div className="container mx-auto px-6">
            <div className="bg-black text-white flex flex-col md:flex-row items-center overflow-hidden shadow-2xl">
              {/* Image Side */}
              <div className="w-full md:w-1/2 h-96 relative bg-gray-900">
                {promoBlock.image_url && (
                  <Image
                    src={promoBlock.image_url}
                    alt={promoBlock.title || 'Promo'}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    quality={60}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Text Side */}
              <div className="w-full md:w-1/2 p-12 md:p-16 text-center md:text-left">
                <h3 className="text-[#DD3468] font-bold tracking-widest uppercase text-sm mb-4">{promoBlock.pre_title}</h3>
                <h2 className="text-4xl md:text-5xl font-bold uppercase mb-6 leading-tight">
                  {promoBlock.title} <br /> <span className="text-gray-500">{promoBlock.subtitle}</span>
                </h2>
                <p className="text-gray-400 mb-8 max-w-md">
                  {promoBlock.description}
                </p>
                <button className="h-14 px-10 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#DD3468] hover:text-white transition-all duration-300 rounded-none">
                  {promoBlock.button_text}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
