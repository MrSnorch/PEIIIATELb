// Service Worker для offline режима
const CACHE_NAME = 'solver-app-v1.0';
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

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если ресурс найден в кэше, возвращаем его
        if (response) {
          console.log('📦 Serving from cache:', event.request.url);
          return response;
        }
        
        // Если нет в кэше, делаем сетевой запрос
        console.log('🌐 Fetching from network:', event.request.url);
        return fetch(event.request).then((response) => {
          // Проверяем валидность ответа
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Кэшируем новый ответ для будущего использования
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
              console.log('💾 Cached new resource:', event.request.url);
            });
          
          return response;
        }).catch((error) => {
          console.log('❌ Network request failed:', error);
          // Для HTML файлов возвращаем кэшированную версию
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          throw error;
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