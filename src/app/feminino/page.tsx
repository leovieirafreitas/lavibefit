import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

async function getGlobalSettings() {
    const { data } = await supabase.from('global_settings').select('value').eq('key', 'top_bar_text').single();
    return data?.value;
}

export default async function FemininoPage() {
    const topBarText = await getGlobalSettings();
    // Fetch only 'Feminino' or 'Roupas' depending on how user categorized
    // Assuming 'Roupas' is the main clothes category for now based on previous inserted data
    // Or we filter everything that isn't Accessories

    // Let's try matching 'Feminino' OR 'Roupas' since the user might have mixed.
    // Actually, in the products manager we had logic for 'Roupas'.
    const { data: products } = await supabase
        .from('products')
        .select('*, variants:product_variants(stock)')
        // .eq('category', 'Roupas') // Uncomment to strict filter
        .order('created_at', { ascending: false });

    // Filtering client side for flexibility if needed, or better via query.
    // Let's filter by 'Roupas' appearing in category
    const filteredProducts = products?.filter(p => p.category === 'Roupas' || p.category === 'Feminino') || [];

    return (
        <main className="min-h-screen bg-white">
            <Navbar initialTopBarText={topBarText} />
            <div className="pt-32 pb-12 container mx-auto px-6">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2">Feminino</h1>
                    <div className="w-24 h-1 bg-[#DD3468] mx-auto"></div>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        Leggings, Tops, Shorts e muito mais. Tecnologia e estilo para o seu treino.
                    </p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            Nenhum produto encontrado nesta categoria.
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
