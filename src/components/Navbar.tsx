"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User, Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import CartDrawer from './CartDrawer';

export default function Navbar({ initialTopBarText }: { initialTopBarText?: string }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [topBarText, setTopBarText] = useState(initialTopBarText || '');
    const [isTopBarVisible, setIsTopBarVisible] = useState(false);
    const { getTotalItems } = useCart();
    const { getTotalFavorites } = useFavorites();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data: textData } = await supabase
                .from('global_settings')
                .select('value')
                .eq('key', 'top_bar_text')
                .single();
            if (textData) setTopBarText(textData.value);

            const { data: activeData } = await supabase
                .from('global_settings')
                .select('value')
                .eq('key', 'top_bar_active')
                .single();
            if (activeData) setIsTopBarVisible(activeData.value === 'true');
        };
        fetchSettings();
    }, []);

    // Search function with debounce
    useEffect(() => {
        const searchProducts = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setSearchLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*, variants:product_variants(stock)')
                .ilike('name', `%${searchQuery}%`)
                .limit(6);

            setSearchResults(data || []);
            setSearchLoading(false);
        };

        const timeoutId = setTimeout(searchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <>
            {/* Header Wrapper - Sticky Top */}
            <header className="fixed top-0 left-0 right-0 z-50 shadow-sm">

                {/* Top Bar - Black with Offers (Optional - can be hidden) */}
                {topBarText && isTopBarVisible && (
                    <div className="bg-black text-white text-[10px] md:text-xs font-bold tracking-widest text-center py-2 uppercase">
                        {topBarText}
                    </div>
                )}

                {/* Main Nav - Gray Background (Atara Style) */}
                <nav className="bg-[#E8E8E8] py-3">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex items-center justify-between">

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 text-gray-700 hover:text-[#DD3468]"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            {/* Logo - Left */}
                            <Link href="/" className="flex-shrink-0">
                                <img
                                    src="/logosite.png"
                                    alt="La Vibi Fit"
                                    className="h-8 md:h-10 w-auto object-contain"
                                />
                            </Link>

                            {/* Desktop Menu - Center */}
                            <div className="hidden lg:flex items-center gap-6 xl:gap-8 absolute left-1/2 transform -translate-x-1/2">
                                <Link
                                    href="/"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/feminino/leggings"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Legging's
                                </Link>
                                <Link
                                    href="/feminino/tops"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Top's
                                </Link>

                                <Link
                                    href="/feminino/shorts"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Shorts
                                </Link>
                                <Link
                                    href="/feminino/conjuntos"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Conjuntos
                                </Link>
                                <Link
                                    href="/blusas-regatas"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Blusas e Regatas
                                </Link>
                                <Link
                                    href="/acessorios"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Acessórios
                                </Link>
                                <Link
                                    href="/lancamentos"
                                    className="text-xs font-semibold text-gray-700 hover:text-[#DD3468] transition-colors whitespace-nowrap"
                                >
                                    Lançamentos
                                </Link>
                            </div>

                            {/* Icons - Right */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="text-gray-700 hover:text-[#DD3468] transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                                <Link href="/favoritos" className="text-gray-700 hover:text-[#DD3468] transition-colors relative">
                                    <Heart className="w-5 h-5" />
                                    {getTotalFavorites() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#DD3468] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {getTotalFavorites()}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={() => setIsCartOpen(true)}
                                    className="relative text-gray-700 hover:text-[#DD3468] transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    {getTotalItems() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#DD3468] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-[60] bg-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 flex justify-between items-center border-b border-gray-200">
                    <img src="/logosite.png" alt="La Vibi Fit" className="h-8 w-auto object-contain" />
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-[#DD3468]">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 flex flex-col space-y-4">
                    <Link href="/" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Home
                    </Link>
                    <Link href="/feminino/leggings" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Legging's
                    </Link>
                    <Link href="/feminino/tops" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Top's
                    </Link>

                    <Link href="/feminino/shorts" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Shorts
                    </Link>
                    <Link href="/feminino/conjuntos" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Conjuntos
                    </Link>
                    <Link href="/blusas-regatas" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Blusas e Regatas
                    </Link>
                    <Link href="/acessorios" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Acessórios
                    </Link>
                    <Link href="/lancamentos" className="text-sm font-semibold text-gray-800 hover:text-[#DD3468] py-2 border-b border-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                        Lançamentos
                    </Link>

                    <div className="pt-4 flex flex-col gap-4 border-t border-gray-200 mt-4">
                        <Link href="/favoritos" className="text-sm font-semibold text-gray-600 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                            <Heart className="w-5 h-5" /> Meus Favoritos ({getTotalFavorites()})
                        </Link>
                    </div>
                </div>
            </div>

            {/* Spacer to prevent content from hiding behind fixed header */}
            <div className={`${topBarText ? 'h-[88px] md:h-[92px]' : 'h-[56px] md:h-[64px]'}`}></div>

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[70] bg-black/50 flex items-start justify-center pt-20" onClick={() => setIsSearchOpen(false)}>
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex items-center gap-3">
                            <Search className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="flex-1 outline-none text-lg"
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {searchLoading ? (
                                <div className="p-8 text-center text-gray-500">Buscando...</div>
                            ) : searchQuery.trim().length < 2 ? (
                                <div className="p-8 text-center text-gray-500">Digite pelo menos 2 caracteres para buscar</div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Nenhum produto encontrado</div>
                            ) : (
                                <div className="divide-y">
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/produto/${product.id}`}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                                                {product.image_url && (
                                                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm">{product.name}</h3>
                                                <p className="text-xs text-gray-500">{product.category}</p>
                                                <p className="text-sm font-bold text-[#DD3468] mt-1">R$ {product.price.toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
