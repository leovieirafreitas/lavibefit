// Service Worker para La Vibe Fit PWA
const CACHE_NAME = 'lavibefit-v1';
const STATIC_CACHE = 'lavibefit-static-v1';
const DYNAMIC_CACHE = 'lavibefit-dynamic-v1';

// Recursos para pré-cache
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Precaching App Shell');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Estratégia de cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições não-GET
    if (request.method !== 'GET') return;

    // Ignorar requisições de API do Supabase (sempre buscar da rede)
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Ignorar requisições de API internas
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Se encontrou no cache, retorna
            if (cachedResponse) {
                return cachedResponse;
            }

            // Senão, busca da rede e armazena no cache dinâmico
            return fetch(request)
                .then((response) => {
                    // Não cachear respostas inválidas
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Clonar a resposta
                    const responseToCache = response.clone();

                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                })
                .catch(() => {
                    // Se falhar, tentar retornar a página offline (se existir)
                    return caches.match('/');
                });
        })
    );
});
