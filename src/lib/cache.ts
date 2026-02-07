/**
 * Sistema de Cache em Memória para Supabase
 * Reduz drasticamente o número de requisições ao banco de dados
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class MemoryCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL = 60 * 1000; // 60 segundos padrão

    /**
     * Busca dados do cache ou executa a função se não existir/expirou
     */
    async get<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.defaultTTL
    ): Promise<T> {
        const now = Date.now();
        const cached = this.cache.get(key);

        // Retorna do cache se válido
        if (cached && cached.expiresAt > now) {
            console.log(`[CACHE HIT] ${key} (${Math.round((cached.expiresAt - now) / 1000)}s restantes)`);
            return cached.data as T;
        }

        // Busca dados novos
        console.log(`[CACHE MISS] ${key} - Buscando dados...`);
        const data = await fetcher();

        // Armazena no cache
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl,
        });

        return data;
    }

    /**
     * Invalida uma chave específica do cache
     */
    invalidate(key: string): void {
        this.cache.delete(key);
        console.log(`[CACHE INVALIDATE] ${key}`);
    }

    /**
     * Invalida todas as chaves que começam com um prefixo
     */
    invalidatePrefix(prefix: string): void {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                count++;
            }
        }
        console.log(`[CACHE INVALIDATE PREFIX] ${prefix} (${count} chaves removidas)`);
    }

    /**
     * Limpa todo o cache
     */
    clear(): void {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`[CACHE CLEAR] ${size} chaves removidas`);
    }

    /**
     * Remove entradas expiradas do cache
     */
    cleanup(): void {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiresAt < now) {
                this.cache.delete(key);
                removed++;
            }
        }

        if (removed > 0) {
            console.log(`[CACHE CLEANUP] ${removed} entradas expiradas removidas`);
        }
    }

    /**
     * Retorna estatísticas do cache
     */
    getStats() {
        const now = Date.now();
        let valid = 0;
        let expired = 0;

        for (const entry of this.cache.values()) {
            if (entry.expiresAt > now) {
                valid++;
            } else {
                expired++;
            }
        }

        return {
            total: this.cache.size,
            valid,
            expired,
        };
    }
}

// Instância global do cache
export const cache = new MemoryCache();

// Cleanup automático a cada 5 minutos
if (typeof window !== 'undefined') {
    setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

/**
 * TTLs pré-configurados para diferentes tipos de dados
 */
export const CacheTTL = {
    PRODUCTS: 2 * 60 * 1000,        // 2 minutos - produtos mudam com frequência
    SETTINGS: 5 * 60 * 1000,        // 5 minutos - configurações raramente mudam
    HOME_CONTENT: 3 * 60 * 1000,    // 3 minutos - conteúdo da home
    REVIEWS: 10 * 60 * 1000,        // 10 minutos - reviews não mudam muito
    VARIANTS: 2 * 60 * 1000,        // 2 minutos - estoque pode mudar
} as const;
