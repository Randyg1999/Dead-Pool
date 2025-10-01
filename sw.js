// Service Worker for Dead Pool Push Notifications
// VERSION: Update this number whenever you deploy changes!
const VERSION = '2025.10.01'; // Use date format: YYYY.MM.DD or increment
const CACHE_NAME = `dead-pool-v${VERSION}`;

const urlsToCache = [
  '/',
  '/index.htm',
  '/styles.css',
  '/script.js',
  '/contestants.js',
  '/manifest.json'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log(`Service Worker ${VERSION} installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(urlsToCache);
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker ${VERSION} activating...`);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    // Try network first for fresh content
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          
          // If not in cache either, return a generic offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Push event - handle incoming notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: '💀 Dead Pool Alert!',
    body: 'Someone has died! Check your standings.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'dead-pool-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Check Standings'
      }
    ]
  };

  // If push has data, parse it
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (e) {
      console.log('Push data was not JSON:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if app is already open
      for (const client of clients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Background sync for checking deaths (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-deaths') {
    console.log('Background sync: checking for deaths');
    // Future: implement background death checking
  }
});

// Message event - handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
