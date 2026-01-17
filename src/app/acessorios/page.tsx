import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function AcessoriosPage() {
    const { data: products } = await supabase
        .from('products')
        .select('*, variants:product_variants(stock)')
        .eq('category', 'Acessórios')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-12 container mx-auto px-6">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2">Acessórios</h1>
                    <div className="w-24 h-1 bg-[#DD3468] mx-auto"></div>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Complemente seu treino com os melhores acessórios.
                    </p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {(!products || products.length === 0) && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            Nenhum acessório encontrado.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
