/**
 * Wrapper do Supabase com Cache Integrado
 * Usa o sistema de cache em memória para reduzir requisições
 */

import { supabase } from './supabase';
import { cache, CacheTTL } from './cache';

/**
 * Busca produtos com cache
 */
export async function getCachedProducts(options?: {
    limit?: number;
    category?: string;
    orderBy?: string;
}) {
    const cacheKey = `products:${JSON.stringify(options || {})}`;

    return cache.get(
        cacheKey,
        async () => {
            let query = supabase
                .from('products')
                .select('*, variants:product_variants(stock)');

            if (options?.category) {
                query = query.eq('category', options.category);
            }

            if (options?.orderBy) {
                query = query.order(options.orderBy, { ascending: true });
            } else {
                query = query.order('display_order', { ascending: true });
            }

            query = query.order('id', { ascending: false });

            if (options?.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        },
        CacheTTL.PRODUCTS
    );
}

/**
 * Busca um produto específico com cache
 */
export async function getCachedProduct(productId: string | number) {
    const cacheKey = `product:${productId}`;

    return cache.get(
        cacheKey,
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;
            return data;
        },
        CacheTTL.PRODUCTS
    );
}

/**
 * Busca variantes de um produto com cache
 */
export async function getCachedVariants(productId: string | number) {
    const cacheKey = `variants:${productId}`;

    return cache.get(
        cacheKey,
        async () => {
            const { data, error } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', productId)
                .order('size');

            if (error) throw error;
            return data || [];
        },
        CacheTTL.VARIANTS
    );
}

/**
 * Busca reviews de um produto com cache
 */
export async function getCachedReviews(productId: string | number, limit: number = 6) {
    const cacheKey = `reviews:${productId}:${limit}`;

    return cache.get(
        cacheKey,
        async () => {
            const { data, error } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        CacheTTL.REVIEWS
    );
}

/**
 * Busca configurações globais com cache
 */
export async function getCachedSettings(key?: string) {
    const cacheKey = key ? `settings:${key}` : 'settings:all';

    return cache.get(
        cacheKey,
        async () => {
            if (key) {
                // Busca uma configuração específica
                const { data, error } = await supabase
                    .from('global_settings')
                    .select('*')
                    .eq('key', key)
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Busca todas as configurações
                const { data, error } = await supabase
                    .from('global_settings')
                    .select('*');

                if (error) throw error;
                return data || [];
            }
        },
        CacheTTL.SETTINGS
    );
}

/**
 * Busca conteúdo da home com cache
 */
export async function getCachedHomeContent() {
    const cacheKey = 'home_content:all';

    return cache.get(
        cacheKey,
        async () => {
            const { data, error } = await supabase
                .from('home_content')
                .select('*');

            if (error) throw error;
            return data || [];
        },
        CacheTTL.HOME_CONTENT
    );
}

/**
 * Invalida cache de produtos (usar após criar/atualizar produto)
 */
export function invalidateProductCache(productId?: string | number) {
    if (productId) {
        cache.invalidate(`product:${productId}`);
        cache.invalidate(`variants:${productId}`);
        cache.invalidate(`reviews:${productId}`);
    }
    cache.invalidatePrefix('products:');
}

/**
 * Invalida cache de configurações
 */
export function invalidateSettingsCache() {
    cache.invalidatePrefix('settings:');
}

/**
 * Invalida cache de conteúdo da home
 */
export function invalidateHomeCache() {
    cache.invalidatePrefix('home_content:');
}
