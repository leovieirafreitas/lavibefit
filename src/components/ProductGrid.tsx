"use client";

import { useState } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '@/lib/supabase';

interface ProductGridProps {
    initialProducts?: any[];
}

export default function ProductGrid({ initialProducts = [] }: ProductGridProps) {
    const [products, setProducts] = useState<any[]>(() => {
        // Garantir unicidade na inicialização
        const seen = new Set();
        return initialProducts.filter(p => {
            const duplicate = seen.has(p.id);
            seen.add(p.id);
            return !duplicate;
        });
    });
    const [loading, setLoading] = useState(false);
    // Se recebemos menos de 4 produtos inicialmente, assumimos que não tem mais.
    const [hasMore, setHasMore] = useState(initialProducts.length >= 4);

    const loadMore = async () => {
        setLoading(true);
        const from = products.length;
        const to = from + 3; // Tenta buscar mais 4 produtos

        const { data } = await supabase
            .from('products')
            .select('*, variants:product_variants(stock)')
            .order('display_order', { ascending: true })
            .order('id', { ascending: false })
            .range(from, to);

        if (data && data.length > 0) {
            setProducts(current => {
                // Filtra duplicatas comparando IDs como String para evitar erro de tipo
                const newItems = data.filter(item => !current.some(curr => String(curr.id) === String(item.id)));
                return [...current, ...newItems];
            });
            if (data.length < 4) {
                setHasMore(false);
            }
        } else {
            setHasMore(false);
        }
        setLoading(false);
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-12 relative">
                    <h2 className="text-2xl md:text-3xl font-bold text-black uppercase tracking-wide inline-block relative z-10 px-4 bg-white">
                        Mais Vendidos
                    </h2>
                    <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-gray-200 -z-0"></div>
                    <p className="text-gray-500 text-sm mt-3 uppercase tracking-widest">Aproveite as ofertas da semana</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                        Nenhum produto encontrado.
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && (
                    <div className="mt-16 text-center">
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            className="py-3 px-10 border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all text-sm rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Carregando...' : 'Carregar Mais Produtos'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
