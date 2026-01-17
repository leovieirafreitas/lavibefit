"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    size: string;
    quantity: number;
    image: string;
    discount_percent?: number;
    pix_discount?: number;
    stock: number;
    color?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (productId: number, size: string, color?: string) => void;
    updateQuantity: (productId: number, size: string, quantity: number, color?: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('lavibefit_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('lavibefit_cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems(currentItems => {
            // Check if item already exists
            const existingIndex = currentItems.findIndex(
                item => item.productId === newItem.productId && item.size === newItem.size && item.color === newItem.color
            );

            if (existingIndex > -1) {
                // Check stock limit
                const currentQty = currentItems[existingIndex].quantity;
                if (currentQty + 1 > newItem.stock) {
                    alert('Quantidade máxima em estoque atingida!');
                    return currentItems;
                }

                // Update quantity
                const updated = [...currentItems];
                updated[existingIndex].quantity += 1;
                return updated;
            } else {
                // Add new item
                return [...currentItems, { ...newItem, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId: number, size: string, color?: string) => {
        setItems(currentItems =>
            currentItems.filter(item => !(item.productId === productId && item.size === size && item.color === color))
        );
    };

    const updateQuantity = (productId: number, size: string, quantity: number, color?: string) => {
        setItems(currentItems => {
            return currentItems.map(item => {
                if (item.productId === productId && item.size === size && item.color === color) {
                    if (quantity <= 0) {
                        // Will be handled by the caller or UI to remove usually, but here we can just return item if logic is outside or filter logic (but map must return item).
                        // Actually the remove logic is usually separate or quantity=0 implies remove via another call.
                        // But if we want to handle it here:
                        return item;
                    }
                    if (quantity > item.stock) {
                        alert(`Quantidade máxima disponível: ${item.stock}`);
                        return { ...item, quantity: item.stock };
                    }
                    return { ...item, quantity };
                }
                return item;
            });
        });

        // Remove items with quantity 0 (optional cleanup if needed, but safer to do explicit remove)
        if (quantity <= 0) {
            removeFromCart(productId, size, color);
        }
    };

    const clearCart = () => {
        setItems([]);
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getSubtotal = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getTotal = () => {
        // For now, just return subtotal
        // Can add shipping, taxes, etc. later
        return getSubtotal();
    };

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getSubtotal,
                getTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
