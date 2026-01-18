// Service Worker для offline режима
const CACHE_NAME = 'solver-app-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  // Звуковые файлы
  '/sounds/coin.mp3',
  '/sounds/dice.mp3',
  '/sounds/wheel.mp3',
  '/sounds/bell.mp3',
  '/sounds/click.mp3'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        // Активируем немедленно
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    // Удаляем старые кэши
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activated');
      // Получаем контроль над всеми страницами
      return self.clients.claim();
    })
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не GET запросы и chrome-extension
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Стратегия "cache-first" для всех запросов
  event.respondWith(
    // Сначала проверяем кэш
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 Serving from cache:', event.request.url);
          return cachedResponse;
        }
        
        // Если нет в кэше, пытаемся загрузить из сети
        console.log('🌐 Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Если запрос успешен, кэшируем ответ
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                  console.log('💾 Cached new resource:', event.request.url);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('❌ Network failed, serving fallback:', error);
            
            // Fallback стратегии для разных типов ресурсов
            if (event.request.headers.get('accept').includes('text/html')) {
              // Для HTML возвращаем главную страницу
              return caches.match('/index.html');
            } else if (event.request.url.includes('/sounds/')) {
              // Для звуков возвращаем успешный пустой ответ
              return new Response('', { status: 200 });
            } else {
              // Для других ресурсов возвращаем кэшированную версию или 404
              return new Response('Resource unavailable offline', { 
                status: 404, 
                headers: { 'Content-Type': 'text/plain' } 
              });
            }
          });
      })
  );
});

// Обработка сообщений от клиентов
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🤖 Service Worker loaded');