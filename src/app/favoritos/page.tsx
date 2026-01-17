"use client";

import { useFavorites } from '@/contexts/FavoritesContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Heart } from 'lucide-react';

export default function FavoritosPage() {
    const { favorites } = useFavorites();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (favorites.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            const productIds = favorites.map(f => f.productId);

            const { data } = await supabase
                .from('products')
                .select('*, variants:product_variants(stock)')
                .in('id', productIds);

            setProducts(data || []);
            setLoading(false);
        };

        fetchProducts();
    }, [favorites]);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-12 container mx-auto px-6">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide mb-2 flex items-center justify-center gap-3">
                        <Heart className="w-10 h-10 text-[#DD3468]" />
                        Meus Favoritos
                    </h1>
                    <div className="w-24 h-1 bg-[#DD3468] mx-auto"></div>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                        {favorites.length > 0
                            ? `Você tem ${favorites.length} ${favorites.length === 1 ? 'produto favorito' : 'produtos favoritos'}`
                            : 'Você ainda não tem produtos favoritos'
                        }
                    </p>
                </header>

                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">Carregando favoritos...</p>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Nenhum favorito ainda
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Explore nossos produtos e adicione seus favoritos aqui!
                        </p>
                        <a
                            href="/"
                            className="inline-block bg-[#DD3468] text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wide hover:bg-[#c42d5c] transition-colors"
                        >
                            Ver Produtos
                        </a>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
