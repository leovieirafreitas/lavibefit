/**
 * Service Worker para Cache Offline
 * Melhora drasticamente a performance ao cachear assets estáticos
 */

const CACHE_NAME = 'lavibefit-v1';
const STATIC_CACHE = 'lavibefit-static-v1';
const DYNAMIC_CACHE = 'lavibefit-dynamic-v1';
const IMAGE_CACHE = 'lavibefit-images-v1';

// Assets para cachear imediatamente
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Precaching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (
                        cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE &&
                        cacheName !== IMAGE_CACHE
                    ) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Interceptar requisições
// Interceptar requisições e gerenciar cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. IGNORAR requisições que não devem ser cacheadas
    // - Supabase (dados frescos sempre)
    // - API local (serverless functions)
    // - Next.js Data (JSONs de navegação)
    // - Admin pages (nunca cachear admin)
    // - Documentos HTML (para garantir que atualizações de deploy apareçam)
    if (
        url.hostname.includes('supabase.co') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/data/') ||
        url.pathname.includes('/admin') ||
        request.destination === 'document' // ⚡ CRÍTICO: Não cachear HTML para evitar "site preso" em versão antiga
    ) {
        return; // Network Only (padrão do navegador)
    }

    // 2. ESTRATÉGIA PARA IMAGENS (Cache First) -> Otimização de Performance
    // Imagens mudam pouco e são pesadas. Cache agressivo aqui é bom.
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    // Retorna do cache se tiver
                    return response;
                }

                return fetch(request).then((fetchResponse) => {
                    // Apenas cacheia respostas válidas e completas
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }

                    const responseToCache = fetchResponse.clone();
                    caches.open(IMAGE_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return fetchResponse;
                });
            })
        );
        return;
    }

    // 3. ESTRATÉGIA PARA ASSETS ESTÁTICOS (JS, CSS, Fonts) -> Cache First
    // Next.js gera hashes nos nomes dos arquivos (ex: main-a1b2c3.js).
    // Se o conteúdo mudar, o nome muda, então é seguro cachear.
    if (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font'
    ) {
        event.respondWith(
            caches.match(request).then((response) => {
                return (
                    response ||
                    fetch(request).then((fetchResponse) => {
                        return caches.open(STATIC_CACHE).then((cache) => {
                            if (fetchResponse.status === 200) {
                                cache.put(request, fetchResponse.clone());
                            }
                            return fetchResponse;
                        });
                    })
                );
            })
        );
    }
});
