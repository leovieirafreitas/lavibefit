import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

async function getGlobalSettings() {
    const { data } = await supabase.from('global_settings').select('value').eq('key', 'top_bar_text').single();
    return data?.value;
}

export default async function LancamentosPage() {
    const topBarText = await getGlobalSettings();
    // In a real scenario, filter by created_at or a 'is_new' flag
    // For now, we fetch all and pretend they are new, or order by created_at
    // We haven't implemented filtering in ProductGrid yet, so we will update it or fetch here.

    // Let's reuse ProductGrid but we might need to make it accept props for products
    // Since ProductGrid currently fetches its own data, I will duplicate/adapt the logic here for simplicity
    // or better: Update ProductGrid to accept an optional 'products' prop.

    // For this specific step, I will create a dedicated grid here to be sure.

    const { data: products } = await supabase
        .from('products')
        .select('*, variants:product_variants(stock)')
        .order('created_at', { ascending: false });

    return (
        <main className="min-h-screen bg-white">
            <Navbar initialTopBarText={topBarText} />
            <div className="pt-32 pb-12 container mx-auto px-6">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2">Lançamentos</h1>
                    <div className="w-24 h-1 bg-[#DD3468] mx-auto"></div>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Confira as últimas novidades da nossa coleção. Peças exclusivas para elevar seu treino.
                    </p>
                </header>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {(!products || products.length === 0) && (
                        <p className="col-span-full text-center text-gray-500 py-12">
                            Nenhum lançamento encontrado.
                        </p>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
