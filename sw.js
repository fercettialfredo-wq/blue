const CACHE_NAME = 'ravens-cache-v31';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon-192.png',
  './icon-512.png',
  './icons/logo.png',
  './icons/home.svg',
  './icons/visita.svg',
  './icons/paquete1.svg',
  './icons/paquete2.svg',
  './icons/paquete3.svg',
  './icons/proveedor.svg',
  './icons/qr.svg',
  './icons/servicio.svg',
  './icons/servicio2.svg',
  './icons/libreta.svg',
  './icons/residente.svg',
  './icons/evento.svg'
];

// 1. INSTALACIÓN
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cacheando archivos del app shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. ACTIVACIÓN
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- LÓGICA NUEVA: ESCUCHAR ORDEN DE ACTUALIZAR ---
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 3. INTERCEPTOR DE RED (INTACTO COMO LO TENÍAS)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('proxyoperador.azurewebsites.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
