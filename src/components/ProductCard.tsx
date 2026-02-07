"use client";

import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image?: string;
    image_url?: string;
    discount_percent?: number | null;
    installments?: string | null;
    pix_discount?: number | null;
    stock?: number;
    is_coming_soon?: boolean;
    launch_date?: string;
    variants?: { stock: number }[];
}

export default function ProductCard({ product }: { product: Product }) {
    const displayImage = product.image_url || product.image || "https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=2574&auto=format&fit=crop";

    // Calculate prices
    // Calculate prices
    const hasDiscount = (product.discount_percent || 0) > 0;
    const originalPrice = hasDiscount ? product.price / (1 - (product.discount_percent || 0) / 100) : product.price;
    const finalPrice = product.price;

    // Calculate PIX price
    const hasPix = (product.pix_discount || 0) > 0;
    const pixPrice = hasPix ? finalPrice * (1 - (product.pix_discount || 0) / 100) : null;

    const isComingSoon = product.is_coming_soon;

    // Calculate total stock from variants if available, otherwise use product.stock
    const totalStock = product.variants?.length
        ? product.variants.reduce((acc, v) => acc + v.stock, 0)
        : (product.stock || 0);

    const isSoldOut = !isComingSoon && totalStock === 0;

    return (
        <Link href={`/produto/${product.id}`} className="group flex flex-col cursor-pointer">

            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3 rounded-2xl">
                <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-80' : ''}`}
                    loading="lazy"
                    quality={50}
                />

                {/* Quick Buy / Status Overlay */}
                <div className={`absolute inset-x-0 bottom-0 text-white text-center py-3 uppercase text-xs font-bold tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2
                    ${isComingSoon ? 'bg-orange-500' : isSoldOut ? 'bg-red-500' : 'bg-black/80'}
                `}>
                    {isComingSoon ? (product.launch_date ? `Lançamento ${product.launch_date}` : 'Lançamento Em Breve') : isSoldOut ? 'Indisponível' : (
                        <><ShoppingBag className="w-4 h-4" /> Comprar Rápido</>
                    )}
                </div>

                {/* Status Badges */}
                {isComingSoon ? (
                    <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 uppercase z-10">
                        EM BREVE
                    </span>
                ) : isSoldOut ? (
                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase z-10">
                        ESGOTADO
                    </span>
                ) : hasDiscount && (
                    <span className="absolute top-0 right-0 bg-[#DD3468] text-white text-[10px] font-bold px-3 py-1 uppercase scale-110">
                        -{product.discount_percent}%
                    </span>
                )}
            </div>

            {/* Info - Centered and Clean matches reference */}
            <div className="text-center">
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-1 group-hover:text-[#DD3468] transition-colors">
                    {product.name}
                </h3>
                {!isComingSoon && (
                    <>
                        <div className="flex justify-center gap-2 items-center">
                            {hasDiscount && (
                                <span className="text-gray-400 text-xs line-through">R$ {originalPrice.toFixed(2)}</span>
                            )}
                            <span className="text-black font-bold text-base">
                                R$ {finalPrice.toFixed(2)}
                            </span>
                        </div>

                        {/* Installments */}
                        {product.installments && (
                            <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">
                                {product.installments}
                            </p>
                        )}

                        {/* PIX Discount */}
                        {hasPix && pixPrice && (
                            <p className="text-green-600 text-[10px] mt-1 font-bold uppercase tracking-wider">
                                R$ {pixPrice.toFixed(2)} no PIX ({product.pix_discount}% OFF)
                            </p>
                        )}
                    </>
                )}
            </div>
        </Link>
    );
}
