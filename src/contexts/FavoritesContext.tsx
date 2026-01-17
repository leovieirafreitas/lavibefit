"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoriteItem {
    productId: number;
    name: string;
    price: number;
    image: string;
    category: string;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    addToFavorites: (item: FavoriteItem) => void;
    removeFromFavorites: (productId: number) => void;
    isFavorite: (productId: number) => boolean;
    getTotalFavorites: () => number;
    clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('lavibefit_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (error) {
                console.error('Error loading favorites:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('lavibefit_favorites', JSON.stringify(favorites));
        }
    }, [favorites, isLoaded]);

    const addToFavorites = (newItem: FavoriteItem) => {
        setFavorites(currentFavorites => {
            // Check if already exists
            const exists = currentFavorites.some(item => item.productId === newItem.productId);
            if (exists) {
                return currentFavorites;
            }
            return [...currentFavorites, newItem];
        });
    };

    const removeFromFavorites = (productId: number) => {
        setFavorites(currentFavorites =>
            currentFavorites.filter(item => item.productId !== productId)
        );
    };

    const isFavorite = (productId: number): boolean => {
        return favorites.some(item => item.productId === productId);
    };

    const getTotalFavorites = () => {
        return favorites.length;
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addToFavorites,
                removeFromFavorites,
                isFavorite,
                getTotalFavorites,
                clearFavorites,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
