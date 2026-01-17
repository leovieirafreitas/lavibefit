"use client";

import { useCart } from '@/contexts/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeFromCart, updateQuantity, getSubtotal, getTotalItems } = useCart();
    const router = useRouter();

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-lg font-bold">Carrinho ({getTotalItems()})</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ShoppingBag className="w-16 h-16 mb-4" />
                                <p className="text-center">Seu carrinho está vazio</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => {
                                    const hasDiscount = (item.discount_percent || 0) > 0;
                                    const originalPrice = hasDiscount
                                        ? item.price / (1 - (item.discount_percent || 0) / 100)
                                        : item.price;

                                    return (
                                        <div key={`${item.productId}-${item.size}-${item.color || ''}`} className="flex gap-3 border-b pb-4">
                                            {/* Image */}
                                            <div className="relative w-20 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col">
                                                <h3 className="font-bold text-sm">{item.name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    Tamanho: {item.size} {item.color && `| Cor: ${item.color}`}
                                                </p>

                                                <div className="mt-1">
                                                    {hasDiscount && (
                                                        <span className="text-xs text-gray-400 line-through mr-2">
                                                            R$ {originalPrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                    <span className="font-bold text-sm">
                                                        R$ {item.price.toFixed(2)}
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1, item.color)}
                                                        className="p-1 border rounded hover:bg-gray-100"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1, item.color)}
                                                        className="p-1 border rounded hover:bg-gray-100"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                                                        className="ml-auto text-red-500 text-xs hover:underline"
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="border-t p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Subtotal:</span>
                                <span className="text-xl font-bold">R$ {getSubtotal().toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-[#DD3468] text-white font-bold py-3 rounded-lg uppercase tracking-wide hover:bg-[#c42d5c] transition-colors"
                            >
                                Finalizar Compra
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full border-2 border-gray-300 text-gray-700 font-bold py-2 rounded-lg uppercase tracking-wide hover:border-[#DD3468] hover:text-[#DD3468] transition-colors"
                            >
                                Continuar Comprando
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
