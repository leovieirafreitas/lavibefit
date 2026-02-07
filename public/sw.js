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
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições do Supabase (sempre buscar dados frescos)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Estratégia: Cache First para imagens
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    console.log('[SW] Serving image from cache:', url.pathname);
                    return response;
                }

                return fetch(request).then((fetchResponse) => {
                    return caches.open(IMAGE_CACHE).then((cache) => {
                        // Cachear apenas imagens bem-sucedidas
                        if (fetchResponse.status === 200) {
                            cache.put(request, fetchResponse.clone());
                        }
                        return fetchResponse;
                    });
                });
            })
        );
        return;
    }

    // Estratégia: Network First para páginas HTML
    if (request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }

    // Estratégia: Cache First para assets estáticos (CSS, JS, fonts)
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
});
